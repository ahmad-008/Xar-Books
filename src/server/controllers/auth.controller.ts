import bcrypt from "bcryptjs";
import crypto from "crypto";
import { HydratedDocument } from "mongoose";
import { after, NextRequest, NextResponse } from "next/server";
import { IUser, User } from "../models/User";
import { AppError } from "../utils/AppError";
import { clearAuthCookie, requireUserId, setAuthCookie } from "../utils/auth";
import { appUrl, readJson } from "../utils/http";
import { toPublicUser } from "../utils/publicUser";
import { sendEmail } from "../utils/sendEmail";
import { clearRateLimit, clientIp, rateLimit } from "../utils/rateLimit";
import { checkEmail, checkName, checkPassword } from "../utils/validate";




const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const DUMMY_HASH = "$2b$12$sR79XRNF.g92SShrm4LUZew5om.Pq0DKmkoZd6rlWin/yNzOJyM8G";


const sendVerificationEmail = async (user: HydratedDocument<IUser>, baseUrl: string) => {
    const verifyToken = crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken = hashToken(verifyToken);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;
    await sendEmail(
        user.email,
        "Verify your Xar Books email",
        `<p>Hi ${user.name.replace(/[<>&"]/g, "")},</p>
         <p>Please confirm your email address.</p>
         <p><a href="${verifyUrl}">Click here to verify your email</a></p>
         <p>This link expires in 24 hours.</p>`
    );
};

export const register = async (req: NextRequest) => {
    const { name, email, password, agreeTerms } = await readJson(req);

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
        throw new AppError("Name, email and password are required", 400);
    }

   const cleanName = checkName(name);
   const cleanEmail = checkEmail(email);
   checkPassword(password);

    if (agreeTerms !== true) {
        throw new AppError("You must accept the terms", 400);
    }
    await rateLimit(`register:${clientIp(req)}`, 5, 60);

    const user = await User.create({ name: cleanName, email: cleanEmail, password, agreeTerms });
    try {
        await sendVerificationEmail(user, appUrl(req));
    } catch (error) {
        console.error("Verification email failed:", error);
    }

    return NextResponse.json(
        {
            success: true,
            message: "Account created. Please check your email to verify it",
            data: toPublicUser(user),
        },
        { status: 201 }
    );
};

export const login = async (req: NextRequest) => {
    const { email, password } = await readJson(req);

    if (typeof email !== "string" || typeof password !== "string") {
        throw new AppError("Email and password are required", 400);
    }
    const limitKey = `login:${clientIp(req)}:${email.trim().toLowerCase()}`;
    await rateLimit(limitKey, 5, 15);

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password +tokenVersion");
    const isPasswordCorrect = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

    if (!user || !isPasswordCorrect) {
        throw new AppError("Invalid email or password", 401);
    }

    if (user.isBlocked) {
        throw new AppError("Your account has been blocked", 403);
    }
    
    await clearRateLimit(limitKey);
    const res = NextResponse.json({ success: true, message: "Logged In", data: toPublicUser(user) });
    setAuthCookie(res, user._id.toString(), user.tokenVersion);
    return res;
};

export const logout = async () => {
    const res = NextResponse.json({ success: true, message: "Logged out" });
    clearAuthCookie(res);
    return res;
};

export const getMe = async (req: NextRequest) => {
    const user = await User.findById(await requireUserId(req));

    if (!user) {
        throw new AppError("Please log in to continue", 401);
    }

    return NextResponse.json({ success: true, data: toPublicUser(user) });
};

const sendResetEmail = async (user: HydratedDocument<IUser>, baseUrl: string) => {
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires= new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    try{
            await sendEmail(
            user.email,
            "Reset your Xar Books password",
            `<p>You asked to reset your password.</p>
             <p><a href="${baseUrl}/reset-password?token=${resetToken}">Click here to choose a new password</a></p>
             <p>This link expires in 15 minutes. If you didn't ask for this, ignore this email.</p>`
        );
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        throw error;
    }

};


export const forgotPassword = async (req: NextRequest) => {
    const { email } = await readJson(req);

    if (typeof email !== "string") {
        throw new AppError("Email is required", 400);
    }
    await rateLimit(`forgot:${clientIp(req)}:${email.trim().toLowerCase()}`,3,60);

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user) {
        const baseUrl = appUrl(req);
        after(()=> sendResetEmail(user, baseUrl).catch((error)=> console.error("Reset email failed:", error)));
    }

    return NextResponse.json({
        success: true,
        message: "If an account exists for that email, a reset link has been sent",
    });
};

export const resetPassword = async (req: NextRequest) => {
    const { token, password } = await readJson(req);

    if (typeof token !== "string" || typeof password !== "string") {
        throw new AppError("Token and new password are required", 400);
    }
    checkPassword(password);

    await rateLimit(`reset:${clientIp(req)}`,10, 15);

    const user = await User.findOne({
        passwordResetToken: hashToken(token),
        passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
        throw new AppError("This reset link is invalid or has expired", 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    await User.updateOne({_id: user._id}, {$inc: {tokenVersion: 1}});



    const res = NextResponse.json({ success: true, message: "Password updated, please log in" });
    clearAuthCookie(res);
    return res;
};

export const verifyEmail = async (req: NextRequest) => {
    const { token } = await readJson(req);

    if (typeof token !== "string") {
        throw new AppError("Verification token is required", 400);
    }
    await rateLimit(`verify:${clientIp(req)}`,10, 15);

    const user = await User.findOne({
        emailVerificationToken: hashToken(token),
        emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
        throw new AppError("This verification link is invalid or has expired", 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Email verified", data: toPublicUser(user) });
};

export const resendVerification = async (req: NextRequest) => {
    const user = await User.findById(await requireUserId(req));

    if (!user) {
        throw new AppError("Please log in to continue", 401);
    }

    if (user.isEmailVerified) {
        throw new AppError("Your email is already verified", 400);
    }

    await rateLimit(`resend:${user._id}`,3,60);

    try {
        await sendVerificationEmail(user, appUrl(req));
    } catch (error) {
        console.error("Verification email failed:", error);
        throw new AppError("Could not send the verification email, please try again later", 500);
    }

    return NextResponse.json({ success: true, message: "Verification email sent" });
};
