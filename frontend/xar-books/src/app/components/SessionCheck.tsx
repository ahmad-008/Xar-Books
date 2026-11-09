"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "@/store/api";
import { logout, setUser } from "@/store/slice/userSlice";
import { RootState } from "@/store/store";




export default function SessionCheck() {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

    const { data, error } = useGetMeQuery(undefined, { skip: !isLoggedIn });

    useEffect(() => {
        if (data) {
            dispatch(setUser(data.data));
        }

    }, [data, dispatch]);

    useEffect(() => {
        if (error && "status" in error && error.status === 401) {
            dispatch(logout());
        }
    }, [error, dispatch]);

    return null;
}