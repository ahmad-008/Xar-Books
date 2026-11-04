import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { AUTH_COOKIE } from "../utils/authCookie";

const notLoggedIn = () => new AppError("Please log in to continue", 401);

// lets a route run only for a logged in user, and puts that user in res.locals.user
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token: unknown = req.cookies?.[AUTH_COOKIE];
    if (typeof token !== "string") {
        throw notLoggedIn();
    }

    let payload: jwt.JwtPayload | string;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET as string, { algorithms: ["HS256"] });
    } catch {
        // the token was changed or has expired
        throw notLoggedIn();
    }

    if (typeof payload === "string") {
        throw notLoggedIn();
    }

    const user = await User.findById(payload.id);
    if (!user) {
        throw notLoggedIn();
    }

    // resetting a password ends every session started before the reset.
    // JWT times are in whole seconds, so compare whole seconds too.
    const changedAt = user.passwordChangedAt;
    if (changedAt && payload.iat !== undefined && payload.iat < Math.floor(changedAt.getTime() / 1000)) {
        throw notLoggedIn();
    }

    res.locals.user = user;
    next();
};
