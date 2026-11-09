"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { CheckCircle2, Eye, EyeOff, LoaderCircle, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResetPasswordMutation } from "@/store/api";
import { logout, toggleLoginDialog } from "@/store/slice/userSlice";
import { getErrorMessage } from "@/lib/getErrorMessage";

interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
}

export default function ResetPasswordForm({ token }: { token: string }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<ResetPasswordFormData>();

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            await resetPassword({ token, password: data.password }).unwrap();
            dispatch(logout());
            setIsDone(true);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const goToLogin = () => {
        router.push("/");
        dispatch(toggleLoginDialog());
    };

    if (!token) {
        return (
            <div className="w-full max-w-md space-y-4 rounded-lg border bg-white p-6 text-center shadow-sm">
                <h1 className="text-2xl font-bold">Invalid reset link</h1>
                <p className="text-sm text-gray-600">
                    This link is incomplete. Please request a new one from the login screen.
                </p>
                <Link href="/" className="text-sm text-primary hover:underline">
                    Back to home
                </Link>
            </div>
        );
    }

    if (isDone) {
        return (
            <div className="w-full max-w-md space-y-4 rounded-lg border bg-white p-6 text-center shadow-sm">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <h1 className="text-2xl font-bold">Password updated</h1>
                <p className="text-sm text-gray-600">You can now log in with your new password.</p>
                <Button onClick={goToLogin} className="w-full rounded-md font-bold normal-case tracking-normal">
                    Log in
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
            <h1 className="text-center text-2xl font-bold">Choose a new password</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-6">
                <div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="New password"
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
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            className="pl-10"
                            {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: (value) => value === getValues("password") || "Passwords do not match",
                            })}
                        />
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full rounded-md font-bold normal-case tracking-normal">
                    {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Update password"}
                </Button>
            </form>
        </div>
    );
}
