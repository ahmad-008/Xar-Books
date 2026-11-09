import { CookieOptions, Response } from 'express';
import jwt from "jsonwebtoken";


const isProduction = process.env.NODE_ENV === "production";

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
};

// called after a successful login: creates the token and gives it to the browser
export const setAuthCookie = (res: Response, userId: string) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is missing from .env");
    }

    const token = jwt.sign({userId}, secret, {expiresIn: "1d"});

    res.cookie("token", token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });
};


// called on logout: tells the browser to delete the cookie
export const clearAuthCookie = (res: Response) => {
    res.clearCookie("token", cookieOptions);
}