import type { Metadata } from "next";
import AdminBooks from "@/app/components/AdminBooks";

export const metadata: Metadata = {
    title: "Books | Xar Books Admin",
};

export default function AdminBooksPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <AdminBooks />
        </div>
    );
}
