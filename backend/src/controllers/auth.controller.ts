import crypto from "crypto";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { HydratedDocument } from "mongoose";
import { IUser, User } from "../models/User";
import { AppError } from "../utils/AppError";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie";
import { sendEmail } from "../utils/sendEmail";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72; // bcrypt ignores everything after 72 bytes
const RESET_LINK_MINUTES = 30;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const assertValidEmail = (email: string) => {
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
        throw new AppError("Enter a valid email", 400);
    }
};

const assertValidPassword = (password: string) => {
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
    }
    if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
        throw new AppError(`Password must be at most ${MAX_PASSWORD_BYTES} characters`, 400);
    }
};

// list the fields one by one: the document in memory can still hold the password hash
const toPublicUser = (user: HydratedDocument<IUser>) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
});

const hashResetToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const register = async (req: Request, res: Response) => {
    // in Express 5, req.body is undefined when a request has no body
    const { name, email, password, agreeTerms } = req.body ?? {};

    // only real strings: "email": { "$ne": null } is a NoSQL injection trick
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || !name.trim()) {
        throw new AppError("Name, email and password are required", 400);
    }

    const cleanEmail = normalizeEmail(email);
    assertValidEmail(cleanEmail);
    assertValidPassword(password);

    if (agreeTerms !== true) {
        throw new AppError("You must accept the terms", 400);
    }

    // only these 4 fields: a "role": "admin" in the request is simply ignored.
    // a duplicate email is rejected by the unique rule in the database, see errorHandler.
    const user = await User.create({ name: name.trim(), email: cleanEmail, password, agreeTerms });

    setAuthCookie(res, user.id);
    res.status(201).json({ success: true, message: "Account created", data: toPublicUser(user) });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
        throw new AppError("Email and password are required", 400);
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select("+password");

    // the same message for both cases, so it doesn't reveal which emails have accounts
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError("Invalid email or password", 401);
    }

    setAuthCookie(res, user.id);
    res.json({ success: true, message: "Logged in", data: toPublicUser(user) });
};

export const logout = (_req: Request, res: Response) => {
    clearAuthCookie(res);
    res.json({ success: true, message: "Logged out" });
};

// runs after requireAuth, which has already loaded the user
export const getMe = (_req: Request, res: Response) => {
    res.json({ success: true, data: toPublicUser(res.locals.user) });
};

const sendPasswordResetEmail = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) return;

    // the email gets the token and the database only keeps its hash,
    // so someone who reads the database still can't use a reset link
    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashResetToken(token);
    user.passwordResetExpires = new Date(Date.now() + RESET_LINK_MINUTES * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const link = `${frontendUrl}/reset-password?token=${token}`;

    await sendEmail({
        to: user.email,
        subject: "Reset your Xar Books password",
        text: `Open this link to choose a new password: ${link}\n\nIt works once and expires in ${RESET_LINK_MINUTES} minutes. If you didn't ask for this, you can ignore this email.`,
        html: `<p>Click the link below to choose a new password.</p><p><a href="${link}">Reset my password</a></p><p>It works once and expires in ${RESET_LINK_MINUTES} minutes. If you didn't ask for this, you can ignore this email.</p>`,
    });
};

export const forgotPassword = (req: Request, res: Response) => {
    const { email } = req.body ?? {};

    if (typeof email !== "string") {
        throw new AppError("Email is required", 400);
    }

    const cleanEmail = normalizeEmail(email);
    assertValidEmail(cleanEmail);

    // not awaited: the reply has the same words and the same speed whether or not
    // the account exists, so nobody can use this form to find out who has an account
    sendPasswordResetEmail(cleanEmail).catch((error) => {
        console.error("Could not send password reset email:", error);
    });

    res.json({
        success: true,
        message: "If an account exists for that email, we've sent a link to reset your password.",
    });
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body ?? {};

    if (typeof token !== "string" || typeof password !== "string") {
        throw new AppError("Reset token and new password are required", 400);
    }

    assertValidPassword(password);

    // select the reset fields: clearing a field that was never loaded wouldn't save,
    // and the link would keep working
    const user = await User.findOne({
        passwordResetToken: hashResetToken(token),
        passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
        throw new AppError("This reset link is invalid or has expired", 400);
    }

    user.password = password;
    user.passwordChangedAt = new Date();
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    clearAuthCookie(res);
    res.json({ success: true, message: "Password updated. You can now log in." });
};
