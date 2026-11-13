"use client";

import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookLoader } from "@/lib/BookLoader";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useClearCartMutation, useGetCartQuery, useRemoveFromCartMutation } from "@/store/api";
import { RootState } from "@/store/store";
import { toggleLoginDialog } from "@/store/slice/userSlice";
import NoData from "./NoData";
import { Card, CardContent } from "@/components/ui/card";







export default function CartContent() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const { data, isLoading, isError } = useGetCartQuery(undefined, { skip: !user });
    const [removeFromCart, { isLoading: isRemoving, originalArgs: removingId }] = useRemoveFromCartMutation();
    const [clearCart, { isLoading: isClearing }] = useClearCartMutation();


    if (!user) {
        return (
            <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold">Your cart</h1>
                <p className="text-gray-600">Log in to see your cart.</p>
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
        return <NoData message="Couldn't load your cart" description="Please check your connection and try again." />;
    }

    const items = data?.data ?? [];

    if (items.length === 0) {
        return (
            <div className="space-y-4 text-center">
                <NoData message="Your cart is empty" description="Books you add to your cart will show here." />
                <Button asChild className="rounded-md normal-case tracking-normal">
                    <Link href="/books">Browse books</Link>
                </Button>
            </div>
        );
    }

    const available = items.filter((item)=> !item.isSold);
    const subtotal = available.reduce((sum, item)=> sum + item.finalPrice, 0);
    const shipping = available.reduce((sum, item)=> sum + item.shippingCharge,0);
    const total = subtotal + shipping;

    const handleClear = async () => {
        if(!window.confirm("Remove all books from your cart?")) return;
        try{
            const result = await clearCart().unwrap();
            toast.success(result.message ?? "Cart cleared");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleRemove = async (id: string) => {
        try {
            const result = await removeFromCart(id).unwrap();
            toast.success(result.message ?? "Removed from cart");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">
                    Your cart <span className="text-base font-normal text-gray-500">({items.length})</span>
                </h1>
                <Button
                    variant="ghost"
                    onClick={handleClear}
                    disabled={isClearing}
                    className="normal-case tracking-normal text-red-600 hover:text-red-700"
                >
                    Clear cart
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
                                <p className="text-xs text-muted-foreground">
                                    {item.shippingCharge > 0 ? `+ $${item.shippingCharge} shipping` : "Free shipping"}
                                </p>

                                <div className="mt-auto flex justify-end pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemove(item._id)}
                                        disabled={isRemoving}
                                        className="normal-case tracking-normal"
                                    >
                                        {isRemoving && removingId === item._id ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="mr-1 h-4 w-4" />
                                                Remove
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                <Card className="h-fit gap-0 rounded-xl py-0 shadow-md">
                    <CardContent className="space-y-3 p-6">
                        <h2 className="text-lg font-semibold">Order summary</h2>
                        <div className="flex justify-between text-sm">
                            <span>Books ({available.length})</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Shipping</span>
                            <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : "Free"}</span>
                        </div>
                        <div className="flex justify-between border-t pt-3 font-bold">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        {available.length < items.length && (
                            <p className="text-xs text-muted-foreground">Sold-out books aren&apos;t included. Remove them to tidy up your cart.</p>
                        )}
                        <Button disabled className="w-full rounded-md normal-case tracking-normal">
                            Checkout (coming soon)
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
