"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api, useGetMeQuery } from "@/store/api";
import { logout, setEmailVerified, setUser } from "@/store/slice/userSlice";
import { RootState } from "@/store/store";

// the browser only remembers that someone logged in. The cookie can expire or the
// password can change, so ask the server whether the login is still good.
const SessionCheck = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

    const { data: user, error } = useGetMeQuery(undefined, {
        skip: !isLoggedIn,
        refetchOnFocus: true,
    });

    useEffect(() => {
        if (user) {
            dispatch(setUser(user));
            dispatch(setEmailVerified(user.isEmailVerified));
        }
    }, [dispatch, user]);

    useEffect(() => {
        // only a 401 means the login is over. If the server is just unreachable, stay logged in.
        if (error && "status" in error && error.status === 401) {
            dispatch(logout());
            // forget this 401, or it would log the user out again right after their next login
            dispatch(api.util.resetApiState());
        }
    }, [dispatch, error]);

    return null;
};

export default SessionCheck;
