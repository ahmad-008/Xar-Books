import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import { IUser, User } from "../models/User";
import { AppError } from "../utils/AppError";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie";


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
