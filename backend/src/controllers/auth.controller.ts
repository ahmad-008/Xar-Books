import { Request, Response } from "express";
import {User} from "../models/User";
import { AppError } from "../utils/AppError";

export const register = async (req: Request, res:Response) => {
    const {name, email, password, agreeTerms} = req.body ?? {};

    if ( typeof name !== "string" || typeof email !== "string" || typeof password !== "string"){
        throw new AppError("Name, email and password are required", 400);
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())){
        throw new AppError("Enter a valid email",400);
    }

    if (agreeTerms !== true){
        throw new AppError("You must accept the terms",400);
    }

    const user = await User.create({name, email, password, agreeTerms});

    res.status(201).json({
        success: true,
        message: "Account created",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    })
    
}