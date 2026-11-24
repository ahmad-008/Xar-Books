import type { Metadata } from "next";
import AdminOrders from "@/app/components/AdminOrders";

export const metadata: Metadata = {
    title: "Orders | Xar Books Admin",
};

export default function AdminOrdersPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <AdminOrders />
        </div>
    );
}