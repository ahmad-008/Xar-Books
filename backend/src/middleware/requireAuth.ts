import { NextFunction, Request, Response } from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import { AppError } from "../utils/AppError";


export const requireAuth = (req: Request, _res:Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if (typeof token !== "string") {
        throw new AppError("Please log in to continue", 401);
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is missing from .env");
    }

    let payload: JwtPayload;

    try{
        payload = jwt.verify (token,secret,{algorithms:['HS256']}) as JwtPayload;
    } catch {
        throw new AppError("Please log in to continue", 401);
    }

    req.userId = payload.userId;
    next();

};