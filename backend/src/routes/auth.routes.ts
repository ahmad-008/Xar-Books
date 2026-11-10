import { Router } from "express";
import { getMe,register,login, logout,forgotPassword, resetPassword, verifyEmail, resendVerification } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";


const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", requireAuth, resendVerification);



export default router;