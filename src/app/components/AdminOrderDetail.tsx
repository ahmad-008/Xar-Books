"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookLoader } from "@/lib/BookLoader";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { STATUS_STYLES } from "@/lib/orderStatus";
import { useAdminCancelOrderMutation, useAdminDeliverOrderMutation, useGetAdminOrderQuery } from "@/store/api";
import NoData from "./NoData";
import PaymentBadge from "./PaymentBadge";

const formatDate = (date: string) => new Date(date).toLocaleString();

export default function AdminOrderDetail({ id }: { id: string }) {
    const { data, isLoading, isError } = useGetAdminOrderQuery(id, { refetchOnMountOrArgChange: true });
    const [cancelOrder, { isLoading: isCancelling }] = useAdminCancelOrderMutation();
    const [deliverOrder, { isLoading: isDelivering }] = useAdminDeliverOrderMutation();

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <BookLoader />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <NoData
                message="Order not found"
                description="The link may be wrong."
                action={
                    <Button asChild variant="outline">
                        <Link href="/admin/orders">Back to orders</Link>
                    </Button>
                }
            />
        );
    }

    const order = data.data;
    const address = order.shippingAddress;
    const hasShipped = order.items.some((item) => item.status === "shipped" || item.status === "delivered");
    const canCancel = order.orderStatus === "processing" && !hasShipped && (order.paymentMethod === "Card" || order.paymentStatus === "pending");
    const canDeliver = order.orderStatus === "shipped";

    const confirmAndRun = async (question: string, action: () => Promise<{ message: string }>) => {
        if (!window.confirm(question)) return;
        try {
            const result = await action();
            toast.success(result.message);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const cancelQuestion =
        order.paymentMethod === "Card" && order.paymentStatus === "paid"
            ? `Cancel this order and refund $${order.totalAmount.toFixed(2)} to the buyer's card?`
            : "Cancel this order? Its books go back on sale.";
    return (
        <div className="space-y-6">
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                All orders
            </Link>

            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">Order #{order._id.slice(-6)}</h1>
                <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${STATUS_STYLES[order.orderStatus]}`}>{order.orderStatus}</span>
            </div>
            <p className="text-sm text-muted-foreground">
                Placed {formatDate(order.createdAt)}
                {order.shippedAt && ` · Shipped ${formatDate(order.shippedAt)}`}
            </p>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="gap-0 py-0 shadow-sm">
                    <CardContent className="space-y-1 p-5 text-sm">
                        <h2 className="mb-2 font-semibold">Buyer</h2>
                        <p className="font-medium">{order.buyer?.name ?? "Deleted user"}</p>
                        <p className="text-muted-foreground">{order.buyer?.email}</p>
                    </CardContent>
                </Card>
                <Card className="gap-0 py-0 shadow-sm">
                    <CardContent className="space-y-1 p-5 text-sm">
                        <h2 className="mb-2 font-semibold">Payment</h2>
                        <p>{order.paymentMethod} · <PaymentBadge status={order.paymentStatus}/></p>
                        {order.paymentStatus === "refunded" && (
                            <p className="text-purple-700">${order.totalAmount.toFixed(2)} refunded to the buyer&apos;s card</p>
                        )}
                        <p className="text-muted-foreground">Books ${order.itemsTotal.toFixed(2)} + shipping ${order.shippingTotal.toFixed(2)}</p>
                        <p className="font-medium">Total ${order.totalAmount.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card className="gap-0 py-0 shadow-sm">
                    <CardContent className="space-y-1 p-5 text-sm">
                        <h2 className="mb-2 font-semibold">Ship to</h2>
                        <p className="font-medium">{address.fullName}</p>
                        <p>{address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}</p>
                        <p>{address.city}, {address.state} {address.postalCode}, {address.country}</p>
                        <p className="text-muted-foreground">{address.phone}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="gap-0 py-0 shadow-sm">
                <CardContent className="overflow-x-auto p-5">
                    <h2 className="mb-3 font-semibold">Books</h2>
                    <table className="w-full text-left text-sm">
                        <thead className="text-muted-foreground">
                            <tr className="border-b">
                                <th className="py-2 pr-4 font-medium">Book</th>
                                <th className="py-2 pr-4 font-medium">Seller</th>
                                <th className="py-2 pr-4 font-medium">Price</th>
                                <th className="py-2 pr-4 font-medium">Shipping</th>
                                <th className="py-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index} className="border-b last:border-0">
                                    <td className="py-2 pr-4 font-medium">{item.title}</td>
                                    <td className="py-2 pr-4">{item.seller?.name ?? "Deleted user"}</td>
                                    <td className="py-2 pr-4">${item.price.toFixed(2)}</td>
                                    <td className="py-2 pr-4">${item.shippingCharge.toFixed(2)}</td>
                                    <td className="py-2">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[item.status]}`}>{item.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Card className="gap-0 py-0 shadow-sm">
                <CardContent className="space-y-3 p-5">
                    <h2 className="font-semibold">Actions</h2>
                    {canCancel || canDeliver ? (
                        <div className="flex flex-wrap gap-2">
                            {canCancel && (
                                <Button
                                    variant="outline"
                                    disabled={isCancelling}
                                    onClick={() => confirmAndRun(cancelQuestion, () => cancelOrder(order._id).unwrap())}
                                    className="text-red-600"
                                >
                                    Cancel order
                                </Button>
                            )}
                            {canDeliver && (
                                <Button
                                    disabled={isDelivering}
                                    onClick={() => confirmAndRun("Mark this order as delivered?", () => deliverOrder(order._id).unwrap())}
                                >
                                    Mark as delivered
                                </Button>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nothing to do for this order right now.</p>
                    )}
                    <p className="text-xs text-muted-foreground">The daily job also cancels unpaid cash-on-delivery orders after 7 days and confirms delivery 14 days after shipping.</p>
                </CardContent>
            </Card>
        </div>
    );
}