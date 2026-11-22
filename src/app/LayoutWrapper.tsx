"use client"

import { startPersist, store } from "@/store/store";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { Toaster } from 'react-hot-toast';
import SessionCheck from "./components/SessionCheck";
import VerifyEmailBanner from "./components/VerifyEmailBanner";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        startPersist();
    }, []);

    return (
        <Provider store={store} >
            <Toaster />
            <SessionCheck />
            <VerifyEmailBanner/>
            {children}
        </Provider>
    )
}