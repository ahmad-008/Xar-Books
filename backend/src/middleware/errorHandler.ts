import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";


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

    // the unique rule in the database rejected a duplicate. This is safer than checking
    // first, because two signups at the same moment could both pass a check.
    // users.email is the only unique field so far.
    if (typeof err === "object" && err !== null && "code" in err && err.code === 11000) {
        res.status(409).json({success: false, message: "An account with this email already exists"});
        return;
    }

    // a rule in a mongoose model failed
    if (err instanceof mongoose.Error.ValidationError) {
        const firstError = Object.values(err.errors)[0];
        res.status(400).json({success: false, message: firstError?.message ?? "Invalid data"});
        return;
    }

     // anything unexpected: log it, but hide the details from the user
     console.error(err);
     res.status(500).json({success: false, message: "Something went wrong"});

};