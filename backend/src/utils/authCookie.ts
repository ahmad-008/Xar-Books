import { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";

export const AUTH_COOKIE = "token";

const SESSION_DAYS = 7;

const baseCookieOptions = (): CookieOptions => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        // JavaScript in the browser can't read it, so a script injection can't steal the session
        httpOnly: true,
        // production runs on HTTPS, and the frontend and API may be on different domains
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    };
};

export const setAuthCookie = (res: Response, userId: string): void => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
        expiresIn: `${SESSION_DAYS}d`,
    });

    res.cookie(AUTH_COOKIE, token, {
        ...baseCookieOptions(),
        maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    });
};

export const clearAuthCookie = (res: Response): void => {
    res.clearCookie(AUTH_COOKIE, baseCookieOptions());
};
