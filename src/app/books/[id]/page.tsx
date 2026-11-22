import type { Metadata } from "next";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/server/config/db";
import { Product } from "@/server/models/Product";
import BookDetails from "./BookDetails";

type Props = { params: Promise<{ id: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { id } = await params;
    if (!isValidObjectId(id)) return { title: "Book not found | Xar Books" };

    await connectDB();
    const book = await Product.findById(id).select("title author description images").lean();
    if (!book) return { title: "Book not found | Xar Books" };

    const description = book.description?.slice(0, 160) || `${book.title} by ${book.author}, a used book on Xar Books.`;
    return {
        title: `${book.title} by ${book.author} | Xar Books`,
        description,
        openGraph: { title: book.title, description, images: book.images.slice(0, 1) },
    };
};

export default function BookPage() {
    return <BookDetails />;
}
