"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { CheckCircle2, Eye, EyeOff, LoaderCircle, Lock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/apiError";
import { api, useResetPasswordMutation } from "@/store/api";
import { logout, toggleLoginDialog } from "@/store/slice/userSlice";

interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
}

const ResetPasswordContent = () => {
    const token = useSearchParams().get("token");
    const dispatch = useDispatch();

    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>();

    const onSubmit = async ({ password }: ResetPasswordFormData) => {
        if (!token) return;

        try {
            await resetPassword({ token, password }).unwrap();
            // a reset ends every session, including one in this browser
            dispatch(logout());
            dispatch(api.util.resetApiState());
            setIsDone(true);
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    };

    const openLoginButton = (
        <Button
            type="button"
            onClick={() => dispatch(toggleLoginDialog())}
            className="w-full rounded-md font-bold normal-case tracking-normal"
        >
            Go to login
        </Button>
    );

    return (
        <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4 py-16">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
                {!token ? (
                    <div className="space-y-4 text-center">
                        <XCircle className="mx-auto h-12 w-12 text-red-500" />
                        <h1 className="text-2xl font-bold">This link isn&apos;t valid</h1>
                        <p className="text-sm text-gray-600">
                            Open the link from your email again, or ask for a new one from
                            &quot;Forgot password?&quot; on the login screen.
                        </p>
                        {openLoginButton}
                    </div>
                ) : isDone ? (
                    <div className="space-y-4 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                        <h1 className="text-2xl font-bold">Password updated</h1>
                        <p className="text-sm text-gray-600">You can now log in with your new password.</p>
                        {openLoginButton}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Choose a new password</h1>
                            <p className="mt-1 text-sm text-gray-600">It must be at least 8 characters.</p>
                        </div>

                        {/* New password */}
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New password"
                                    autoComplete="new-password"
                                    className="pl-10 pr-10"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    className="pl-10"
                                    {...register("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: (value, formValues) =>
                                            value === formValues.password || "Passwords don't match",
                                    })}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-md font-bold normal-case tracking-normal"
                        >
                            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Update password"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordContent;
