
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "/api"


export interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
    phoneNumber?: string;
    profilePicture?: string;
}

export interface AdminStats{
    users: number;
    booksForSale: number;
    booksSold: number;
    orders: number;
    ordersByStatus:Record<"processing" | "shipped" | "delivered" | "cancelled", number>;
    revenue: number;
    recentOrders: {
        _id: string;
        buyer: {name: string; email: string} | null;
        totalAmount: number;
        orderStatus: "processing" | "shipped" |"delivered" | "cancelled";
        paymentMethod: "COD" | "Card";
        createdAt: string;
    }[];
    recentUsers: {
        _id: string;
        name: string;
        email: string;
        role: "user" | "admin";
        createdAt: string;
    }[];
}

interface AdminStatsResponse {
    success: boolean;
    data: AdminStats;
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

export interface ShippingAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface OrderItem {
    product: string;
    seller: string;
    title: string;
    image: string;
    price: number;
    shippingCharge: number;
    status: "processing" | "shipped" | "delivered" | "cancelled";
    
}

export type PaymentMethod = "COD" | "Card";
export interface Order {
    _id: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    itemsTotal: number;
    shippingTotal: number;
    totalAmount: number;
    paymentMethod: "COD" | "Card";
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
    createdAt: string;
}

export interface AdminOrder extends Omit<Order, "items">{
    buyer: {name: string; email: string} | null;
    items: (Omit<OrderItem, "seller"> & {seller: {name: string} | null})[];
}

interface AdminOrdersResponse{
    success: boolean;
    data: AdminOrder[];
    pagination: { page: number; limit: number; total: number; pages: number };
}

export interface AdminUser{
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
    isBlocked?: boolean;
    createdAt: string;
}

interface AdminUsersResponse{
    success: boolean;
    data: AdminUser[];
    pagination: { page: number; limit: number; total: number; pages: number };
}

interface OrderResponse {
    success: boolean;
    message?: string;
    data: Order;
    checkoutUrl?: string;
}

interface OrderListResponse {
    success: boolean;
    data: Order[];
}

export interface SellingOrder {
    _id: string;
    createdAt: string;
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    paymentStatus: Order["paymentStatus"];
    orderStatus: Order["orderStatus"];
    items: OrderItem[];
}

interface SellingOrderResponse {
    success: boolean;
    message?: string;
    data: SellingOrder;
}

interface SellingOrderListResponse {
    success: boolean;
    data: SellingOrder[];
}

export type ProductUpdate = Partial<
    Pick<Product, "title" | "subject" | "category" | "condition" | "classType" | "author" | "edition" | "description" | "price" | "finalPrice" | "shippingCharge">
>;

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
    tagTypes: ["User", "Product", "Cart", "Wishlist", "Order"],
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

        updateProduct: builder.mutation<ProductResponse, { id: string; body: ProductUpdate }>({
            query: ({ id, body }) => ({ url: `/products/${id}`, method: "PATCH", body }),
            invalidatesTags: ["Product", "Cart", "Wishlist"],
        }),

        updateProductImages: builder.mutation<ProductResponse, { id: string; body: FormData }>({
            query: ({ id, body }) => ({ url: `/products/${id}/images`, method: "PUT", body }),
            invalidatesTags: ["Product", "Cart", "Wishlist"],
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

        createOrder: builder.mutation<OrderResponse, { paymentMethod: PaymentMethod; shippingAddress: ShippingAddress }>({
            query: (body) => ({ url: "/orders", method: "POST", body }),
            invalidatesTags: ["Cart", "Product", "Order"],
        }),

        getAdminStats: builder.query<AdminStatsResponse, void>({
            query: () => "/admin/stats",
            providesTags:["Order", "Product", "User"],
        }),

        removeProduct: builder.mutation<MessageResponse,string>({
            query: (id) => ({url: `/admin/products/${id}`, method: "DELETE"}),
            invalidatesTags: ["Product"],
        }),

        getAdminOrders: builder.query<AdminOrdersResponse, { status: string; email: string; page: number }>({
            query: ({ status, email, page }) => {
                const params = new URLSearchParams({ page: String(page) });
                if (status) params.set("status", status);
                if (email) params.set("email", email);
                return `/admin/orders?${params}`;
            },
            providesTags: ["Order"],
        }),

        getAdminUsers: builder.query<AdminUsersResponse, {search: string; page: number}>({
            query: ({search, page}) => {
                const params = new URLSearchParams({page: String(page)});
                if (search) params.set("search", search);
                return `/admin/users?${params}`;
            },
            providesTags: ["User"],
        }),

        setUserBlocked:builder.mutation<MessageResponse, {id: string; blocked: boolean}>({
            query: ({id, blocked}) => ({url: `/admin/users/${id}`, method: "PATCH", body:{blocked}}),
            invalidatesTags: ["User", "Product"],
        }),

        getMyOrders: builder.query<OrderListResponse, void>({
            query: () => "/orders",
            providesTags: ["Order"],
        }),

        getOrder: builder.query<OrderResponse, string>({
            query: (id) => `/orders/${id}`,
            providesTags: ["Order"],
        }),

        cancelOrder: builder.mutation<OrderResponse, string>({
            query: (id) => ({ url: `/orders/${id}/cancel`, method: "POST" }),
            invalidatesTags: ["Order", "Product"],
        }),

        payOrder: builder.mutation<{ success: boolean; checkoutUrl: string }, string>({
            query: (id) => ({url: `/orders/${id}/pay`, method: "POST"}),
            invalidatesTags: ["Order", "Product"],
        }),

        confirmReceived: builder.mutation<OrderResponse, string>({
            query: (id) => ({url: `/orders/${id}/received`, method: "POST"}),
            invalidatesTags: ["Order"],
        }),

        confirmCheckout:builder.query<OrderResponse, string>({
            query: (sessionId) => `/orders/confirm?session_id=${encodeURIComponent(sessionId)}`,
            providesTags: ["Order"],
        }),
        
        getSellingOrders: builder.query<SellingOrderListResponse, void>({
            query: () => "/orders/selling",
            providesTags: ["Order"],
        }),

        updateSellingStatus: builder.mutation<SellingOrderResponse, { id: string; status: "shipped" | "delivered" }>({
            query: ({ id, status }) => ({ url: `/orders/selling/${id}`, method: "PATCH", body: { status } }),
            invalidatesTags: ["Order"],
        }),
        rejectSellingOrder: builder.mutation<SellingOrderResponse, string>({
            query: (id) => ({ url: `/orders/selling/${id}/reject`, method: "POST" }),
            invalidatesTags: ["Order", "Product"],
        }),

        updateProfile: builder.mutation<AuthResponse,{name?: string; phoneNumber?: string}>({
            query: (body) => ({ url: "/users/me", method: "PATCH", body }),
            invalidatesTags: ["User"],
        }),

         updateAvatar: builder.mutation<AuthResponse, FormData>({
            query: (body) => ({ url: "/users/me/avatar", method: "POST", body }),
            invalidatesTags: ["User"],
        }),

        changePassword: builder.mutation<MessageResponse, { currentPassword: string; newPassword: string }>({
            query: (body) => ({ url: "/users/me/password", method: "PATCH", body }),
        }),

        sendContactMessage: builder.mutation<MessageResponse, { name: string; email: string; subject?: string; message: string }>({
            query: (body) => ({ url: "/contact", method: "POST", body }),
        }),


    }),
});

export const {
    useGetAdminStatsQuery,
    useRemoveProductMutation,
    useGetAdminOrdersQuery,
    useGetAdminUsersQuery,
    useSetUserBlockedMutation,
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
    useUpdateProductMutation,
    useUpdateProductImagesMutation,
    useDeleteProductMutation,
    useGetCartQuery,
    useAddToCartMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
    useCreateOrderMutation,
    useGetMyOrdersQuery,
    useGetOrderQuery,
    useCancelOrderMutation,
    usePayOrderMutation,
    useConfirmReceivedMutation,
    useConfirmCheckoutQuery,
    useGetSellingOrdersQuery,
    useUpdateSellingStatusMutation,
    useRejectSellingOrderMutation,
    useUpdateProfileMutation,
    useUpdateAvatarMutation,
    useChangePasswordMutation,
    useSendContactMessageMutation,
} = api;

