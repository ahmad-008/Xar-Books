"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { BookLoader } from "@/lib/BookLoader";
import { useDeleteProductMutation, useGetMyProductsQuery } from "@/store/api";
import { toggleLoginDialog } from "@/store/slice/userSlice";
import { RootState } from "@/store/store";
import NoData from "@/app/components/NoData";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";



export default function MyListings() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const { data, isLoading, isError } = useGetMyProductsQuery(undefined, { skip: !user });
    const [deleteProduct, {isLoading: isDeleting, originalArgs: deletingId}]= useDeleteProductMutation();


    if (!user) {
        return (
            <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold">My listings</h1>
                <p className="text-gray-600">Log in to see the books you&apos;ve listed.</p>

                <Button onClick={() => dispatch(toggleLoginDialog())} className="normal-case tracking-normal" >
                    Log in / Sign up
                </Button>

            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-16" >
                <BookLoader />
            </div>
        );
    }

    if (isError) {
        return <NoData message="Couldn't load your listings" description="Please check your connection and try again." />
    }

    const products = data?.data ?? [];

    const handleDelete = async (id: string, title: string)=> {
        if(!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
        try{
            const result = await deleteProduct(id).unwrap();
            toast.success(result.message ?? "Listing deleted");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-6" >
            <div className="flex flex-wrap items-center justify-between gap-4" >
                <div>
                    <h1 className="text-2xl font-bold">My listings</h1>
                    <p className="text-sm text-gray-600">
                        {products.length} {products.length === 1 ? "book" : "books"} listed
                    </p>
                </div>

                <Button asChild className="rounded-md normal-case tracking-normal">
                    <Link href="/book-sell">
                        <Plus className="mr-1 h-4 w-4" />
                        Sell a book
                    </Link>
                </Button>

            </div>
            {products.length === 0 ? (
                <NoData message="No books listed yet" description="Books you put up for sale will show here." />
            ) : (
                <ul className="space-y-4">
                    {products.map((book) => (
                        <li key={book._id} className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm">
                            <Link href={`/books/${book._id}`} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md bg-gray-50">
                                <Image
                                    src={book.images[0] || "/images/no-book.jpg"}
                                    alt={book.title}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </Link>

                            <div className="flex min-w-0 flex-1 flex-col">
                                <div className="flex items-start justify-between gap-2">
                                    <Link href={`/books/${book._id}`} className="line-clamp-2 font-semibold hover:underline">
                                        {book.title}
                                    </Link>
                                    <Badge variant={book.isSold ? "secondary" : "default"}>
                                        {book.isSold ? "Sold" : "For sale"}
                                    </Badge>
                                </div>
                                <p className="mt-1 font-bold">${book.finalPrice}</p>
                                <p className="text-xs text-muted-foreground">
                                    Listed {formatDistanceToNow(new Date(book.createdAt), { addSuffix: true })}
                                </p>

                                <div className="mt-auto flex justify-end pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(book._id, book.title)}
                                        disabled={book.isSold || isDeleting}
                                        className="normal-case tracking-normal text-red-600 hover:text-red-700"
                                    >
                                        {isDeleting && deletingId === book._id ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="mr-1 h-4 w-4" />
                                                Delete
                                            </>
                                        )}
                                    </Button>
                                </div>

                            </div>
                        </li>
                    ))}
                </ul>
            )}

        </div>







    );
}