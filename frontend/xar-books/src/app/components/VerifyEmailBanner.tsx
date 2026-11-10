"use client";

import { getErrorMessage } from "@/lib/getErrorMessage";
import { useResendVerificationMutation } from "@/store/api";
import { RootState } from "@/store/store";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";


export default function VerifyEmailBanner() {
    const user = useSelector((state: RootState) => state.user.user);
    const [resendVerification, { isLoading }] = useResendVerificationMutation();

    if (!user || user.isEmailVerified) return null;

    const handleResend = async () => {
        try {
            const result = await resendVerification().unwrap();
            toast.success(result.message);
        } catch (error) {
            toast.error(getErrorMessage(error));

        }
    };

    return (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
            Please verify your email address ({user.email}).{" "}
            <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="font-semibold underline disabled:opacity-50"
            >
                {isLoading ? "Sending..." : "Resend email"}
            </button>
        </div>
    );
}