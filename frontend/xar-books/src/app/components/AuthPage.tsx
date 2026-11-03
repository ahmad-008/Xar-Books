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
import { useForm } from "react-hook-form";
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";





interface AuthPageProps {
    isLoginOpen: boolean;
    setIsLoginOpen: (open: boolean) => void;
}

type AuthTab = "login" | "signup" | "forgot";

interface LoginFormData {
    email: string;
    password: string;
}


const AuthPage = ({ isLoginOpen, setIsLoginOpen }: AuthPageProps) => {
    const [currentTab, setCurrentTab] = useState<AuthTab>("login");

    const [showPassword, setShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    const {
        register: registerLogin,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors },
    } = useForm<LoginFormData>();


    const onSubmitLogin = async (data: LoginFormData) => {
        setLoginLoading(true);
        // TODO (backend phase): call the login API here
        console.log("login data:", data);
        setLoginLoading(false);
    };



    return (
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
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




                    <TabsContent value="signup">Sign up form goes here</TabsContent>
                    <TabsContent value="forgot">Forgot password form goes here</TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog >
    );
};

export default AuthPage;
