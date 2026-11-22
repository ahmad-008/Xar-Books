"use client";

import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { CreditCard, LoaderCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookLoader } from "@/lib/BookLoader";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { Order, useCancelOrderMutation, useGetMyOrdersQuery, usePayOrderMutation } from "@/store/api";
import { RootState } from "@/store/store";
import { setLoginDialogOpen } from "@/store/slice/userSlice";
import NoData from "./NoData";

const STATUS_STYLES: Record<Order["orderStatus"], string> = {
    processing: "bg-amber-100 text-amber-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-gray-200 text-gray-700",
};

const canCancel = (order: Order) =>
    order.orderStatus === "processing" && 
    order.items.every((item) => item.status === "processing" || item.status === "cancelled");

const canPay=  (order: Order) => 
    order.paymentMethod === "Card" && order.paymentStatus === "pending" && order.orderStatus === "processing";

const paymentLabel = (order: Order) => {
    if (order.paymentStatus === "refunded") return "refunded";
    if (order.orderStatus === "cancelled") return "not charged";
    return order.paymentStatus;
};

export default function MyOrdersContent() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const { data, isLoading, isError } = useGetMyOrdersQuery(undefined, { skip: !user, refetchOnMountOrArgChange: true, });
    const [cancelOrder, { isLoading: isCancelling, originalArgs: cancellingId }] = useCancelOrderMutation();
    const [payOrder, { isLoading: isPaying, originalArgs: payingId }] = usePayOrderMutation();

    if (!user) {
        return (
            <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold">My orders</h1>
                <p className="text-gray-600">Log in to see your orders.</p>
                <Button onClick={() => dispatch(setLoginDialogOpen(true))} className="normal-case tracking-normal">
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
        return <NoData message="Couldn't load your orders" description="Please check your connection and try again." />;
    }

    const orders = data?.data ?? [];

    if (orders.length === 0) {
        return (
            <div className="space-y-4 text-center">
                <NoData message="No orders yet" description="Books you order will show here." />
                <Button asChild className="rounded-md normal-case tracking-normal">
                    <Link href="/books">Browse books</Link>
                </Button>
            </div>
        );
    }

    const handleCancel = async (order: Order) => {
        const note = order.paymentStatus === "paid" ? " You'll get a full refund to your card." : "";
        if (!window.confirm(`Cancel this order?${note}`)) return;
        try {
            const result = await cancelOrder(order._id).unwrap();
            toast.success(result.message ?? "Order cancelled");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handlePay = async (id: string) => {
        try {
            const result =await payOrder(id).unwrap();
            window.location.assign(result.checkoutUrl);
        } catch(error){
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My orders</h1>
            <ul className="space-y-4">
                {orders.map((order) => (
                    <li key={order._id} className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className="text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()} · #{order._id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[order.orderStatus]}`}>
                                {order.orderStatus}
                            </span>
                        </div>

                        <ul className="space-y-2">
                            {order.items.map((item) => (
                                <li key={item.product} className="flex items-center gap-3">
                                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-gray-50">
                                        <Image src={item.image || "/images/no-book.jpg"} alt={item.title} fill sizes="40px" className="object-cover" />
                                    </div>
                                    <span className="line-clamp-1 min-w-0 flex-1 text-sm">{item.title}</span>
                                    {order.orderStatus !== "cancelled" && (
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[item.status]}`}>
                                            {item.status}
                                        </span>
                                    )}
                                    <span className="text-sm">${item.price.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                            <Badge variant="secondary">
                                {order.paymentMethod === "COD" ? "Cash on delivery" : "Card"} · {paymentLabel(order)}
                            </Badge>
                            <div className="flex items-center gap-3">
                                {canPay(order) && (
                                    <Button
                                        size="sm"
                                        onClick={() => handlePay(order._id)}
                                        disabled={isPaying}
                                        className="normal-case tracking-normal"
                                    >
                                        {isPaying && payingId === order._id ? (
                                            <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
                                        ) : (
                                            <CreditCard className="mr-1 h-4 w-4" />
                                        )

                                        }
                                        Pay now
                                    </Button>
                                )

                                }
                                {canCancel(order) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCancel(order)}
                                        disabled={isCancelling}
                                        className="normal-case tracking-normal text-red-600 hover:text-red-700"
                                    >
                                        {isCancelling && cancellingId === order._id ? (
                                            <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
                                        ) : (
                                            <XCircle className="mr-1 h-4 w-4" />
                                        )}
                                        Cancel order
                                    </Button>
                                )}
                                <span className="font-bold">Total ${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
