"use client"

import { persistor, store } from "@/store/store";
import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {BookLoader } from "@/lib/BookLoader"; 
import { Toaster } from 'react-hot-toast';


export default function LayoutWrapper({children}:{children:React.ReactNode}){
    return(
        <Provider store={store} >
            <PersistGate loading={<BookLoader />}  persistor={persistor}>
                <Toaster/>
                {children}
            </PersistGate>
        </Provider>
    )
}