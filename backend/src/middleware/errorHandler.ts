import { NextFunction, Request, Response } from "express";
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

     // anything unexpected: log it, but hide the details from the user
     console.error(err);
     res.status(500).json({success: false, message: "Something went wrong"});

};