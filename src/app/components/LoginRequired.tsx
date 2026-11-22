"use client";

import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { setLoginDialogOpen } from "@/store/slice/userSlice";

export default function LoginRequired({ title, message }: { title: string; message: string }) {
    const dispatch = useDispatch();
    return (
        <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-gray-600">{message}</p>
            <Button onClick={() => dispatch(setLoginDialogOpen(true))} className="normal-case tracking-normal">
                Log in / Sign up
            </Button>
        </div>
    );
}
