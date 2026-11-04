import rateLimit from "express-rate-limit";

const MINUTE = 60 * 1000;

// slows down password guessing
export const authLimiter = rateLimit({
    windowMs: 15 * MINUTE,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
});

// stricter, because each request can send an email to someone
export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * MINUTE,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many reset requests. Please try again later." },
});
