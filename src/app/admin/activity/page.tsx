import type { Metadata } from "next";
import AdminActivity from "@/app/components/AdminActivity";

export const metadata: Metadata = {
    title: "Activity | Xar Books Admin",
};

export default function AdminActivityPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <AdminActivity />
        </div>
    );
}