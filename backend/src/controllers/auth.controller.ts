import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import { IUser, User } from "../models/User";
import { AppError } from "../utils/AppError";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie";
import crypto from "crypto";
import {sendEmail} from "../utils/sendEmails";




const toPublicUser = (user: HydratedDocument<IUser>) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
});


export const register = async (req: Request, res: Response) => {
    const { name, email, password, agreeTerms } = req.body ?? {};

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
        throw new AppError("Name, email and password are required", 400);
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        throw new AppError("Enter a valid email", 400);
    }

    if (agreeTerms !== true) {
        throw new AppError("You must accept the terms", 400);
    }

    const user = await User.create({ name, email, password, agreeTerms });

    res.status(201).json({
        success: true,
        message: "Account created",
        data: toPublicUser(user),


    })

};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
        throw new AppError("Email and password are required", 400);
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");


    const isPasswordCorrect = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isPasswordCorrect) {
        throw new AppError("Invalid email or password", 401);
    }

    setAuthCookie(res, user._id.toString());

    res.json({
        success: true,
        message: "Logged In",
        data: toPublicUser(user),
    });

};


export const logout = (_req: Request, res: Response) => {
    clearAuthCookie(res);

    res.json({
        success: true,
        message: "Logged out",
    });

};


export const getMe = async (req: Request, res: Response) => {
    const user = await User.findById(req.userId);

    if (!user) {
        throw new AppError("Please log in to continue",401);
    }

    res.json({success: true, data: toPublicUser(user)});
};


export const forgotPassword = async (req: Request, res: Response) => {

    const {email} = req.body ?? {};

    if (typeof email !== "string"){
        throw new AppError("Email is required", 400);
    }

    const user = await User.findOne ({email: email.trim().toLowerCase()});

    if (user) {
        const resetToken = crypto.randomBytes(32).toString("hex");

        user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.passwordResetExpires = new Date(Date.now() + 15 *60 *1000);
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        try {
            await sendEmail(
                user.email,
                "Reset your Xar Books password",
                `<p>You asked to reset your password.</p>
                <p> <a href="${resetUrl}">Click here to choose a new password</a></p>
                <p>This link expires in 15 minutes. If you didn't ask for this, ignore this email.</p>`
                
            );
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            console.error("Reset email failed:",error);
            throw new AppError("Could not send the reset email, please try again later", 500);

        }
    }

    res.json({
        success: true,
        message: "If an account exists for that email, a reset link has been sent",
    });



};



export const resetPassword = async (req: Request, res: Response) => {
     const {token, password} = req.body ?? {};

     if ( typeof token !== "string" || typeof password !== "string"){
        throw new AppError ("Token and new password are required", 400);
     }

     const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

     const user = await User.findOne({
        passwordResetToken : hashedToken,
        passwordResetExpires : { $gt: new Date()},
     });

     if (!user){
        throw new AppError("This reset link is invalid or has expired", 400);
     }

     user.password = password;
     user.passwordResetToken = undefined;
     user.passwordResetExpires = undefined;
     await user.save();

     clearAuthCookie(res);

     res.json({
        success: true,
        message: "Password updated, please log in",
     });


};