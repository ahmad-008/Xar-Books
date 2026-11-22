import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { BookLoader } from "@/lib/BookLoader";
import BooksContent from "./BooksContent";

export const metadata: Metadata = {
    title: "Browse used books | Xar Books",
    description: "Search used school, college, exam and reading books by condition, class and price.",
};

export default async function BooksPage() {
    await connection();
    return (
        <Suspense fallback={<BookLoader />}>
            <BooksContent />
        </Suspense>
    );
}