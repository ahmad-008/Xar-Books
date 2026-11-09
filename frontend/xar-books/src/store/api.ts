
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"


export interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
    profilePicture?: string;
}

interface AuthResponse {
    success: boolean;
    message?: string;
    data: User;
}

interface MessageResponse {
    success: boolean;
    message: string;
}

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["User"],
    endpoints: (builder) => ({

        register: builder.mutation<AuthResponse, { name: string; email: string; password: string; agreeTerms: boolean }>({
            query: (body) => ({ url: "/auth/register", method: "POST", body }),
        }),

        login: builder.mutation<AuthResponse, { email: string; password: string }>({
            query: (body) => ({ url: "/auth/login", method: "POST", body }),
            invalidatesTags: ["User"],
        }),

        logout: builder.mutation<MessageResponse, void>({
            query: () => ({ url: "/auth/logout", method: "POST" }),
        }),

        getMe: builder.query<AuthResponse, void>({
            query: () => "/auth/me",
            providesTags: ["User"],
        }),

        forgotPassword: builder.mutation<MessageResponse, { email: string }>({
            query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),

        }),

        resetPassword: builder.mutation<MessageResponse, { token: string; password: string }>({
            query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useLogoutMutation,
    useGetMeQuery,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = api;