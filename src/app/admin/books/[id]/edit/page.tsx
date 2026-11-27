import type { Metadata } from "next";
import EditListingContent from "@/app/components/EditListingContent";

export const metadata: Metadata = {
    title: "Edit Book | Xar Books Admin",
};

export default function AdminEditBookPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <EditListingContent doneUrl="/admin/books" />
        </div>
    );
}