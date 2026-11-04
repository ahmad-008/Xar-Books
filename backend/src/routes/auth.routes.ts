import { Router } from "express";
import {
    forgotPassword,
    getMe,
    login,
    logout,
    register,
    resetPassword,
} from "../controllers/auth.controller";
import { authLimiter, forgotPasswordLimiter } from "../middleware/rateLimit";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

export default router;
