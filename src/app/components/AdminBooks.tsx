"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookLoader } from "@/lib/BookLoader";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useGetProductsQuery, useRemoveProductMutation } from "@/store/api";
import NoData from "./NoData";
import Pagination from "./Pagination";

export default function AdminBooks() {
    const [text, setText] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useGetProductsQuery({ search, page, limit: 10 }, { refetchOnMountOrArgChange: true });
    const [removeProduct, { isLoading: isRemoving }] = useRemoveProductMutation();

    const books = data?.data ?? [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(text.trim());
        setPage(1);
    };

    const handleRemove = async (id: string, title: string) => {
        if (!window.confirm(`Remove "${title}"? This can't be undone.`)) return;
        try {
            const result = await removeProduct(id).unwrap();
            toast.success(result.message ?? "Listing removed");
            if (books.length === 1 && page > 1) setPage(page - 1);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Books</h1>
                    <p className="text-sm text-muted-foreground">{data?.pagination?.total ?? 0} for sale</p>
                </div>
                <Button asChild>
                    <Link href="/admin/books/new">
                        <Plus className="h-4 w-4" />
                        Add book
                    </Link>
                </Button>
            </div>

            <form onSubmit={handleSearch} className="flex max-w-md gap-2">
                <Input placeholder="Title, author or subject" aria-label="Search books" value={text} onChange={(e) => setText(e.target.value)} />
                <Button type="submit" size="icon" aria-label="Search">
                    <Search className="h-4 w-4" />
                </Button>
            </form>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <BookLoader />
                </div>
            ) : isError ? (
                <NoData message="Couldn't load the books" description="Please check your connection and try again." />
            ) : books.length === 0 ? (
                <NoData message="No books found" description="Try a different search." />
            ) : (
                <Card className="gap-0 py-0 shadow-sm">
                    <CardContent className="overflow-x-auto p-5">
                        <table className="w-full text-left text-sm">
                            <thead className="text-muted-foreground">
                                <tr className="border-b">
                                    <th className="py-2 pr-4 font-medium">Book</th>
                                    <th className="py-2 pr-4 font-medium">Seller</th>
                                    <th className="py-2 pr-4 font-medium">Price</th>
                                    <th className="py-2 pr-4 font-medium">Listed</th>
                                    <th className="py-2 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book) => (
                                    <tr key={book._id} className="border-b last:border-0">
                                        <td className="py-2 pr-4">
                                            <Link href={`/books/${book._id}`} className="font-medium hover:underline">{book.title}</Link>
                                        </td>
                                        <td className="py-2 pr-4">{typeof book.seller === "object" && book.seller ? book.seller.name : "Deleted user"}</td>
                                        <td className="py-2 pr-4">${book.finalPrice.toFixed(2)}</td>
                                        <td className="py-2 pr-4">{new Date(book.createdAt).toLocaleDateString()}</td>
                                        <td className="py-2">
                                            <Button variant="outline" size="sm" disabled={isRemoving} onClick={() => handleRemove(book._id, book.title)} className="text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                                Remove
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            <Pagination currentPage={page} totalPages={data?.pagination?.pages ?? 0} onPageChange={setPage} />
        </div>
    );
}