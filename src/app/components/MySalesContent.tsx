"use client";

import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LoaderCircle, MapPin, Truck, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookLoader } from "@/lib/BookLoader";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { OrderItem, SellingOrder, useGetSellingOrdersQuery, useUpdateSellingStatusMutation } from "@/store/api";
import { RootState } from "@/store/store";
import { toggleLoginDialog } from "@/store/slice/userSlice";
import NoData from "./NoData";

const ITEM_STYLES: Record<OrderItem["status"], string> = {
    processing: "bg-amber-100 text-amber-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
};

const nextAction = (order: SellingOrder) => {
    if (order.orderStatus === "cancelled") return null;
    if (order.items.every((item) => item.status === "processing")) return "shipped" as const;
    if (order.items.every((item) => item.status === "shipped")) return "delivered" as const;
    return null;
};

export default function MySalesContent() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const { data, isLoading, isError } = useGetSellingOrdersQuery(undefined, {
        skip: !user,
        refetchOnMountOrArgChange: true,
    });
    const [updateStatus, { isLoading: isUpdating, originalArgs }] = useUpdateSellingStatusMutation();

    if (!user) {
        return (
            <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold">My sales</h1>
                <p className="text-gray-600">Log in to see the books you&apos;ve sold.</p>
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
        return <NoData message="Couldn't load your sales" description="Please check your connection and try again." />;
    }

    const orders = data?.data ?? [];

    if (orders.length === 0) {
        return (
            <div className="space-y-4 text-center">
                <NoData message="No sales yet" description="When someone buys one of your books, it will show here." />
                <Button asChild className="rounded-md normal-case tracking-normal">
                    <Link href="/book-sell">Sell a book</Link>
                </Button>
            </div>
        );
    }

    const handleUpdate = async (id: string, status: "shipped" | "delivered") => {
        if (status === "delivered" && !window.confirm("Confirm the buyer has received these books?")) return;
        try {
            const result = await updateStatus({ id, status }).unwrap();
            toast.success(result.message ?? "Order updated");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My sales</h1>
            <ul className="space-y-4">
                {orders.map((order) => {
                    const action = nextAction(order);
                    const address = order.shippingAddress;
                    const isBusy = isUpdating && originalArgs?.id === order._id;
                    const myTotal = order.items.reduce((sum, item) => sum + item.price + item.shippingCharge, 0);

                    return (
                        <li key={order._id} className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                <span className="text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString()} · #{order._id.slice(-6).toUpperCase()}
                                </span>
                                <Badge variant="secondary">
                                    {order.paymentMethod === "COD" ? "Cash on delivery" : "Card"} · {order.paymentStatus}
                                </Badge>
                            </div>

                            <ul className="space-y-2">
                                {order.items.map((item) => (
                                    <li key={item.product} className="flex items-center gap-3">
                                        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-gray-50">
                                            <Image src={item.image || "/images/no-book.jpg"} alt={item.title} fill sizes="40px" className="object-cover" />
                                        </div>
                                        <span className="line-clamp-1 min-w-0 flex-1 text-sm">{item.title}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ITEM_STYLES[item.status]}`}>
                                            {item.status}
                                        </span>
                                        <span className="w-16 text-right text-sm">${item.price.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-2 rounded-md bg-gray-50 p-3 text-sm">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                <address className="not-italic">
                                    <strong>{address.fullName}</strong> · {address.phone}
                                    <br />
                                    {address.addressLine1}
                                    {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                                    <br />
                                    {address.city}, {address.state} {address.postalCode}, {address.country}
                                </address>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                                <span>
                                    You earn <strong>${myTotal.toFixed(2)}</strong>
                                    <span className="text-muted-foreground"> (incl. shipping)</span>
                                </span>

                                {order.orderStatus === "cancelled" ? (
                                    <Badge variant="secondary">Cancelled</Badge>
                                ) : action ? (
                                    <Button
                                        size="sm"
                                        onClick={() => handleUpdate(order._id, action)}
                                        disabled={isUpdating}
                                        className="normal-case tracking-normal"
                                    >
                                        {isBusy ? (
                                            <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
                                        ) : action === "shipped" ? (
                                            <Truck className="mr-1 h-4 w-4" />
                                        ) : (
                                            <PackageCheck className="mr-1 h-4 w-4" />
                                        )}
                                        {action === "shipped" ? "Mark as shipped" : "Mark as delivered"}
                                    </Button>
                                ) : (
                                    <span className="font-medium text-green-700">Delivered</span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
