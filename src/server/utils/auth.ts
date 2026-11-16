import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./AppError";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
};

const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is missing from .env.local");
    }
    return secret;
};

export const setAuthCookie = (res: NextResponse, userId: string) => {
    const token = jwt.sign({ userId }, getSecret(), { expiresIn: "1d" });
    res.cookies.set("token", token, { ...cookieOptions, maxAge: 24 * 60 * 60 });
};

export const clearAuthCookie = (res: NextResponse) => {
    res.cookies.set("token", "", { ...cookieOptions, maxAge: 0 });
};

export const requireUserId = (req: NextRequest) => {
    const token = req.cookies.get("token")?.value;
    if (!token) {
        throw new AppError("Please log in to continue", 401);
    }

    let payload: JwtPayload;
    try {
        payload = jwt.verify(token, getSecret(), { algorithms: ["HS256"] }) as JwtPayload;
    } catch {
        throw new AppError("Please log in to continue", 401);
    }

    if (typeof payload.userId !== "string") {
        throw new AppError("Please log in to continue", 401);
    }

    return payload.userId;
};
