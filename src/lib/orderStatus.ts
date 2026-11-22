import type { OrderItem } from "@/store/api";

export const STATUS_STYLES: Record<OrderItem["status"], string> = {
    processing: "bg-amber-100 text-amber-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-gray-200 text-gray-700",
};
