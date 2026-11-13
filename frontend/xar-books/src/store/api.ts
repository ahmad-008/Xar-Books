
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

export interface Product {
    _id: string;
    title: string;
    images: string[];
    subject: string;
    category: string;
    condition: "Excellent" | "Good" | "Fair";
    classType: string;
    price: number;
    finalPrice: number;
    shippingCharge: number;
    author?: string;
    edition?: string;
    description?: string;
    seller: string | { _id: string; name: string };
    isSold: boolean;
    createdAt: string;
}

export interface ProductFilters {
    search?: string;
    category?: string[];
    condition?: string[];
    classType?: string[];
    sort?: "newest" | "price-asc" | "price-desc";
    page?: number;
    limit?: number;
}

interface ProductListResponse {
    success: boolean;
    data: Product[];
    pagination?: { page: number; limit: number; total: number; pages: number };
}

export interface CartItem {
    _id: string;
    title: string;
    images: string[];
    price: number;
    finalPrice: number;
    shippingCharge: number;
    condition: Product["condition"];
    isSold: boolean;
    seller: { _id: string; name: string };
}

interface CartResponse {
    success: boolean;
    message?: string;
    data: CartItem[];
}

interface ProductResponse {
    success: boolean;
    message?: string;
    data: Product;
}


export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        credentials: "include",
    }),
    tagTypes: ["User", "Product", "Cart", "Wishlist"],
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

        verifyEmail: builder.mutation<AuthResponse, { token: string }>({
            query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
        }),

        resendVerification: builder.mutation<MessageResponse, void>({
            query: () => ({ url: "/auth/resend-verification", method: "POST" }),
        }),

        getProducts: builder.query<ProductListResponse, ProductFilters>({
            query: (filters) => {
                const params = new URLSearchParams();
                if (filters.search) params.set("search", filters.search);
                filters.category?.forEach((value) => params.append("category", value));
                filters.condition?.forEach((value) => params.append("condition", value));
                filters.classType?.forEach((value) => params.append("classType", value));
                if (filters.sort) params.set("sort", filters.sort);
                if (filters.page) params.set("page", String(filters.page));
                if (filters.limit) params.set("limit", String(filters.limit));
                return `/products?${params.toString()}`;

            },
            providesTags: ["Product"],
        }),

        getProduct: builder.query<ProductResponse, string>({
            query: (id) => `/products/${id}`,
            providesTags: ["Product"],
        }),

        getMyProducts: builder.query<ProductListResponse, void>({
            query: () => "/products/mine",
            providesTags: ["Product"],
        }),

        createProduct: builder.mutation<ProductResponse, FormData>({
            query: (body) => ({ url: "/products", method: "POST", body }),
            invalidatesTags: ["Product"],
        }),

        deleteProduct: builder.mutation<MessageResponse, string>({
            query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
            invalidatesTags: ["Product"],
        }),

        getCart: builder.query<CartResponse, void>({
            query: () => "/cart",
            providesTags: ["Cart"],
        }),

        addToCart: builder.mutation<CartResponse, string>({
            query: (productId) => ({ url: "/cart", method: "POST", body: { productId } }),
            invalidatesTags: ["Cart"],
        }),

        removeFromCart: builder.mutation<CartResponse, string>({
            query: (productId) => ({ url: `/cart/${productId}`, method: "DELETE" }),
            invalidatesTags: ["Cart"],
        }),

        clearCart: builder.mutation<CartResponse, void>({
            query: () => ({ url: "/cart", method: "DELETE" }),
            invalidatesTags: ["Cart"],
        }),

        getWishlist: builder.query<CartResponse, void>({
            query: () => "/wishlist",
            providesTags: ["Wishlist"],
        }),

        addToWishlist: builder.mutation<CartResponse, string>({
            query: (productId) => ({ url: "/wishlist", method: "POST", body: { productId } }),
            invalidatesTags: ["Wishlist"],
        }),

        removeFromWishlist: builder.mutation<CartResponse, string>({
            query: (productId) => ({ url: `/wishlist/${productId}`, method: "DELETE" }),
            invalidatesTags: ["Wishlist"],
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
    useVerifyEmailMutation,
    useResendVerificationMutation,
    useGetProductsQuery,
    useGetProductQuery,
    useGetMyProductsQuery,
    useCreateProductMutation,
    useDeleteProductMutation,
    useGetCartQuery,
    useAddToCartMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} = api;

