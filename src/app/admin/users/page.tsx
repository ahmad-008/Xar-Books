import type { Metadata } from "next";
import AdminUsers from "@/app/components/AdminUsers";

export const metadata: Metadata = {
    title: "Users | Xar Books Admin",
};

export default function AdminUsersPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <AdminUsers />
        </div>
    );
}