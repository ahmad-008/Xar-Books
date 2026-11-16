"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { useVerifyEmailMutation } from "@/store/api";
import { setUser } from "@/store/slice/userSlice";
import { RootState } from "@/store/store";
import { getErrorMessage } from "@/lib/getErrorMessage";

type Status = "loading" | "success" | "error";

export default function VerifyEmailStatus({ token }: { token: string }) {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const [verifyEmail] = useVerifyEmailMutation();
    const [status, setStatus] = useState<Status>(token ? "loading" : "error");
    const [message, setMessage] = useState(token ? "" : "This link is incomplete.");
    const hasRun = useRef(false);

    useEffect(() => {
        if (!token || hasRun.current) return;
        hasRun.current = true;

        verifyEmail({ token })
            .unwrap()
            .then((result) => {
                if (user?.id === result.data.id) {
                    dispatch(setUser(result.data));
                }
                setStatus("success");
            })
            .catch((error) => {
                setMessage(getErrorMessage(error));
                setStatus("error");
            });
    }, [token, verifyEmail, dispatch, user]);

    return (
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-white p-6 text-center shadow-sm">
            {status === "loading" && (
                <>
                    <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-gray-400" />
                    <h1 className="text-2xl font-bold">Verifying your email...</h1>
                </>
            )}

            {status === "success" && (
                <>
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                    <h1 className="text-2xl font-bold">Email verified</h1>
                    <p className="text-sm text-gray-600">Thanks! Your email address is confirmed.</p>
                </>
            )}

            {status === "error" && (
                <>
                    <XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h1 className="text-2xl font-bold">Verification failed</h1>
                    <p className="text-sm text-gray-600">{message}</p>
                    <p className="text-sm text-gray-600">Log in and use &quot;Resend email&quot; to get a new link.</p>
                </>
            )}

            <Link href="/" className="block text-sm text-primary hover:underline">
                Back to home
            </Link>
        </div>
    );
}
