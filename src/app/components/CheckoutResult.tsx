"use client";

import Link from "next/link";
import { CircleCheck, CircleX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookLoader } from "@/lib/BookLoader";
import { useConfirmCheckoutQuery } from "@/store/api";

export default function CheckoutResult({ sessionId }: { sessionId: string }) {
    const { data, isLoading, isError } = useConfirmCheckoutQuery(sessionId, { skip: !sessionId });
    const order = isError ? undefined : data?.data;

    if (sessionId && isLoading) {
        return (
            <div className="flex justify-center py-16">
                <BookLoader />
            </div>
        );
    }

    let icon = <CircleX className="mx-auto h-12 w-12 text-red-600" />;
    let title = "We couldn't find this payment";
    let text = "If you paid, your order will show in My orders. Make sure you're logged in to the account you ordered with.";

    if (order?.paymentStatus === "paid") {
        icon = <CircleCheck className="mx-auto h-12 w-12 text-green-600" />;
        title = "Thank you for your order!";
        text = `Your payment for order #${order._id.slice(-6).toUpperCase()} went through. The seller will ship your books soon.`;
    } else if (order?.orderStatus === "cancelled") {
        title = "Your payment didn't go through";
        text = "This order was cancelled and you weren't charged. The books are back on sale, so you can order them again.";
    } else if (order) {
        icon = <Clock className="mx-auto h-12 w-12 text-amber-600" />;
        title = "Your payment hasn't finished yet";
        text = "If you closed the payment page, you can finish paying from My orders with the Pay now button.";
    }

    return (
        <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
            {icon}
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-gray-600">{text}</p>
            <Button asChild className="rounded-md normal-case tracking-normal">
                <Link href="/account/orders">View my orders</Link>
            </Button>
        </div>
    );
}
