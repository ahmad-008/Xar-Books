import type { Metadata } from "next";
import AdminDashboard from "@/app/components/AdminDashboard";

export const metadata: Metadata = {
    title: "Admin Dashboard | Xar Books",
};

export default function AdminPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <AdminDashboard/>
        </div>
    );
}