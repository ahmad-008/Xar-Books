import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import mongoose from "mongoose";
import multer from "multer";

// runs when no route matched the request
export const notFound = (req: Request , _res: Response, next: NextFunction) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};


// every error in the app ends up here
export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
)=> {
    // errors we threw on purpose: safe to show the message
    if (err instanceof AppError){
        res.status(err.statusCode).json({success: false , message: err.message});
        return;
    }

    // the request body was broken JSON
    if (err instanceof SyntaxError && "body" in err){
        res.status(400).json({success: false, message: "Invalid JSON in request body"});
        return;
    }

    // a schema rule failed, like a password that's too short
    if (err instanceof mongoose.Error.ValidationError){
        const firstError = Object.values(err.errors)[0];
        res.status(400).json({ success: false, message: firstError?.message ?? "Invalid data" })
        return;
    }

    // an upload broke a limit, like a photo that's too big
    if (err instanceof multer.MulterError) {
        const message =
        err.code === "LIMIT_FILE_SIZE" ? "Each image must be 1 MB or smaller":
        err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE" ? "You can upload up to 4 images":
        err.message;
        res.status(400).json({success: false, message});
        return
    }

    // MongoDB rejected a duplicate value: email is our only unique field
    if (typeof err === "object" && err !== null && "code" in err && err.code=== 11000){
        res.status(409).json({ success: false, message: "An account with this email already exists" });
        return;
    }


     // anything unexpected: log it, but hide the details from the user
     console.error(err);
     res.status(500).json({success: false, message: "Something went wrong"});

};