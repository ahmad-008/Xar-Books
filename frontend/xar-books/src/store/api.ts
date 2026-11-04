
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthUser } from "@/store/slice/userSlice";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface UserResponse {
    success: boolean;
    message?: string;
    data: AuthUser;
}

interface MessageResponse {
    success: boolean;
    message: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput extends LoginInput {
    name: string;
    agreeTerms: boolean;
}

export interface ResetPasswordInput {
    token: string;
    password: string;
}

export const api= createApi ({
    baseQuery: fetchBaseQuery({
        baseUrl:BASE_URL,
        credentials:"include",
    }),
    tagTypes:['User'],
    endpoints:(builder) =>({
        register: builder.mutation<AuthUser, RegisterInput>({
            query: (body) => ({ url: "/auth/register", method: "POST", body }),
            transformResponse: (response: UserResponse) => response.data,
        }),
        login: builder.mutation<AuthUser, LoginInput>({
            query: (body) => ({ url: "/auth/login", method: "POST", body }),
            transformResponse: (response: UserResponse) => response.data,
        }),
        logout: builder.mutation<MessageResponse, void>({
            query: () => ({ url: "/auth/logout", method: "POST" }),
        }),
        getMe: builder.query<AuthUser, void>({
            query: () => "/auth/me",
            transformResponse: (response: UserResponse) => response.data,
            providesTags: ['User'],
        }),
        forgotPassword: builder.mutation<MessageResponse, { email: string }>({
            query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
        }),
        resetPassword: builder.mutation<MessageResponse, ResetPasswordInput>({
            query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
        }),
    })
})

export const {
    useRegisterMutation,
    useLoginMutation,
    useLogoutMutation,
    useGetMeQuery,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = api;
