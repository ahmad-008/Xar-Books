"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LoaderCircle, Lock, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useForgotPasswordMutation, useLoginMutation, useRegisterMutation } from "@/store/api";
import { authStatus, setUser } from "@/store/slice/userSlice";
import { getErrorMessage } from "@/lib/getErrorMessage";





interface AuthPageProps {
    isLoginOpen: boolean;
    setIsLoginOpen: (open: boolean) => void;
}

type AuthTab = "login" | "signup" | "forgot";

interface LoginFormData {
    email: string;
    password: string;
}

interface SignupFormData {
    name: string;
    email: string;
    password: string;
    agreeTerms: boolean;
}

interface ForgotPasswordFormData {
    email: string;
}



const AuthPage = ({ isLoginOpen, setIsLoginOpen }: AuthPageProps) => {
    const [currentTab, setCurrentTab] = useState<AuthTab>("login");

    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const [login, {isLoading: loginLoading}] = useLoginMutation();

    const {
        register: registerLogin,
        handleSubmit: handleLoginSubmit,
        reset: resetLogin,
        formState: { errors: loginErrors },
    } = useForm<LoginFormData>();


    const onSubmitLogin = async (data: LoginFormData) => {
        try {
            const result = await login(data).unwrap();
            dispatch(setUser(result.data));
            dispatch(authStatus());
            toast.success("Logged in successfully");
            handleOpenChange(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const [registerUser, {isLoading: signupLoading}] = useRegisterMutation();

    const {
        register: registerSignup,
        handleSubmit: handleSignupSubmit,
        control: signupControl,
        reset: resetSignup,
        formState: { errors: signupErrors },
    } = useForm<SignupFormData>({ defaultValues: { agreeTerms: false } });

    const onSubmitSignup = async (data: SignupFormData) => {
        try {
            await registerUser(data).unwrap();
            toast.success("Account created! Please log in");
            resetSignup();
            setCurrentTab("login");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

     const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation();


    // true after the reset email is "sent", so we show a success message instead of the form
    const [forgotSuccess, setForgotSuccess] = useState(false);

    const {
        register: registerForgot,
        handleSubmit: handleForgotSubmit,
        reset: resetForgot,
        formState: { errors: forgotErrors },
    } = useForm<ForgotPasswordFormData>();

        const onSubmitForgot = async (data: ForgotPasswordFormData) => {
        try {
            await forgotPassword(data).unwrap();
            setForgotSuccess(true);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };


    // every time the dialog closes, start fresh: Login tab, empty forms, no errors
    const handleOpenChange = (open: boolean) => {
        setIsLoginOpen(open);
        if (!open) {
            setCurrentTab("login");
            setShowPassword(false);
            setForgotSuccess(false);
            resetLogin();
            resetSignup();
            resetForgot();
        }
    };




    return (
        <Dialog open={isLoginOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="p-6 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold">
                        Welcome to Xar Books
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Login or create an account to buy and sell books
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as AuthTab)}>
                    {/* hide the tab buttons on the forgot password screen */}
                    {currentTab !== "forgot" && (
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                    )}

                    <TabsContent value="login">
                        <form onSubmit={handleLoginSubmit(onSubmitLogin)} className="space-y-4 pt-4" >
                            {/* Email */}

                            <div>
                                <div className="relative" >
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        className="pl-10"
                                        {...registerLogin("email", {
                                            required: "Email is required",
                                            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                                        })

                                        }
                                    />

                                </div>

                                {loginErrors.email && (
                                    <p className="mt-1 text-sm text-red-500" >{loginErrors.email.message}</p>
                                )

                                }
                            </div>

                            {/* Password */}
                            <div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="pl-10 pr-10"
                                        {...registerLogin("password", { required: "Password is required" })}
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
                                {loginErrors.password && (
                                    <p className="mt-1 text-sm text-red-500" >{loginErrors.password.message}</p>
                                )

                                }
                            </div>

                            <Button
                                type="submit"
                                disabled={loginLoading}
                                className="w-full rounded-md font-bold normal-case tracking-normal"
                            >
                                {loginLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Login"}
                            </Button>



                        </form>

                        <p className="mt-4 text-center text-sm">
                            <button
                                type="button"
                                onClick={() => setCurrentTab("forgot")}
                                className="text-primary hover:underline"
                            >
                                Forgot password?
                            </button>
                        </p>



                    </TabsContent>




                    <TabsContent value="signup">
                        <form onSubmit={handleSignupSubmit(onSubmitSignup)} className="space-y-4 pt-4">
                            {/* Name */}
                            <div>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        type="text"
                                        placeholder="Full name"
                                        className="pl-10"
                                        {...registerSignup("name", { required: "Name is required" })}
                                    />
                                </div>
                                {signupErrors.name && (
                                    <p className="mt-1 text-sm text-red-500">{signupErrors.name.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        className="pl-10"
                                        {...registerSignup("email", {
                                            required: "Email is required",
                                            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                                        })}
                                    />
                                </div>
                                {signupErrors.email && (
                                    <p className="mt-1 text-sm text-red-500">{signupErrors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="pl-10 pr-10"
                                        {...registerSignup("password", {
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
                                {signupErrors.password && (
                                    <p className="mt-1 text-sm text-red-500">{signupErrors.password.message}</p>
                                )}
                            </div>

                            {/* Terms checkbox */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <Controller
                                        name="agreeTerms"
                                        control={signupControl}
                                        rules={{ validate: (value) => value || "You must accept the terms" }}
                                        render={({ field }) => (
                                            <Checkbox
                                                id="agreeTerms"
                                                checked={field.value}
                                                onCheckedChange={(checked) => field.onChange(checked === true)}
                                            />
                                        )}
                                    />
                                    <Label htmlFor="agreeTerms" className="text-sm font-normal text-gray-600">
                                        I accept the
                                        <Link href="/terms-of-use" target="_blank" className="text-primary hover:underline">
                                            Terms
                                        </Link>
                                        and
                                        <Link href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                                            Privacy Policy
                                        </Link>
                                    </Label>
                                </div>
                                {signupErrors.agreeTerms && (
                                    <p className="mt-1 text-sm text-red-500">{signupErrors.agreeTerms.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={signupLoading}
                                className="w-full rounded-md font-bold normal-case tracking-normal"
                            >
                                {signupLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Sign Up"}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="forgot">
                        {forgotSuccess ? (
                            <div className="space-y-4 pt-4 text-center">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                                <h3 className="text-lg font-semibold">Check your email</h3>
                                <p className="text-sm text-gray-600">
                                    If an account exists for that email, we&apos;ve sent a link to reset your password.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotSubmit(onSubmitForgot)} className="space-y-4 pt-4">
                                <p className="text-sm text-gray-600">
                                    Enter your email and we&apos;ll send you a link to reset your password.
                                </p>

                                <div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                                        <Input
                                            type="email"
                                            placeholder="Email"
                                            className="pl-10"
                                            {...registerForgot("email", {
                                                required: "Email is required",
                                                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                                            })}
                                        />
                                    </div>
                                    {forgotErrors.email && (
                                        <p className="mt-1 text-sm text-red-500">{forgotErrors.email.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="w-full rounded-md font-bold normal-case tracking-normal"
                                >
                                    {forgotLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Send reset link"}
                                </Button>
                            </form>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                setCurrentTab("login");
                                setForgotSuccess(false);
                                resetForgot();
                            }}
                            className="mx-auto mt-4 flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog >
    );
};

export default AuthPage;
