"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Heart, LoaderCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookLoader } from "@/lib/BookLoader";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useAddToCartMutation, useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/store/api";
import { toggleLoginDialog } from "@/store/slice/userSlice";
import { RootState } from "@/store/store";
import NoData from "@/app/components/NoData";

type Busy = { id: string; action: "move" | "remove" } | null;

export default function WishlistContent() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const { data, isLoading, isError } = useGetWishlistQuery(undefined, { skip: !user });
    const [addToCart] = useAddToCartMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();
    const [busy, setBusy] = useState<Busy>(null);

    if (!user) {
        return (
            <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold">My wishlist</h1>
                <p className="text-gray-600">Log in to see the books you&apos;ve saved.</p>
                <Button onClick={() => dispatch(toggleLoginDialog())} className="normal-case tracking-normal">
                    Log in / Sign up
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <BookLoader />
            </div>
        );
    }

    if (isError) {
        return <NoData message="Couldn't load your wishlist" description="Please check your connection and try again." />;
    }

    const items = data?.data ?? [];

    if (items.length === 0) {
        return (
            <div className="space-y-4 text-center">
                <NoData message="Your wishlist is empty" description="Tap the heart on any book to save it here." />
                <Button asChild className="rounded-md normal-case tracking-normal">
                    <Link href="/books">Browse books</Link>
                </Button>
            </div>
        );
    }

    const handleMoveToCart = async (id: string) => {
        setBusy({ id, action: "move" });
        try {
            await addToCart(id).unwrap();
            await removeFromWishlist(id).unwrap();
            toast.success("Moved to cart");
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setBusy(null);
        }
    };

    const handleRemove = async (id: string) => {
        setBusy({ id, action: "remove" });
        try {
            const result = await removeFromWishlist(id).unwrap();
            toast.success(result.message ?? "Removed from wishlist");
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">
                My wishlist <span className="text-base font-normal text-gray-500">({items.length})</span>
            </h1>

            <ul className="space-y-4">
                {items.map((item) => (
                    <li key={item._id} className={`flex gap-4 rounded-lg border bg-white p-4 shadow-sm ${item.isSold ? "opacity-60" : ""}`}>
                        <Link href={`/books/${item._id}`} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md bg-gray-50">
                            <Image
                                src={item.images[0] || "/images/no-book.jpg"}
                                alt={item.title}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                                <Link href={`/books/${item._id}`} className="line-clamp-2 font-semibold hover:underline">
                                    {item.title}
                                </Link>
                                {item.isSold && <Badge variant="secondary">Sold out</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {item.condition} · Sold by {item.seller.name}
                            </p>
                            <p className="mt-1 font-bold">${item.finalPrice}</p>

                            <div className="mt-auto flex flex-wrap justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemove(item._id)}
                                    disabled={busy !== null}
                                    className="normal-case tracking-normal"
                                >
                                    {busy?.id === item._id && busy.action === "remove" ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Heart className="mr-1 h-4 w-4 fill-red-500 text-red-500" />
                                            Remove
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleMoveToCart(item._id)}
                                    disabled={busy !== null || item.isSold}
                                    className="normal-case tracking-normal"
                                >
                                    {busy?.id === item._id && busy.action === "move" ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <ShoppingCart className="mr-1 h-4 w-4" />
                                            Move to cart
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
