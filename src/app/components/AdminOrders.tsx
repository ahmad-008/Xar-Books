"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookLoader } from "@/lib/BookLoader";
import { STATUS_STYLES } from "@/lib/orderStatus";
import { useGetAdminOrdersQuery } from "@/store/api";
import NoData from "./NoData";
import Pagination from "./Pagination";
import PaymentBadge from "./PaymentBadge";

const STATUSES = ["", "processing", "shipped", "delivered", "cancelled"] as const;

export default function AdminOrders() {
    const [status, setStatus] = useState("");
    const [text, setText] = useState("");
    const [email, setEmail] = useState("");
    const [page, setPage] = useState(1);
    const [openId, setOpenId] = useState<string | null>(null);
    const { data, isLoading, isError } = useGetAdminOrdersQuery({ status, email, page }, { refetchOnMountOrArgChange: true });

    const orders = data?.data ?? [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setEmail(text.trim());
        setPage(1);
    };

    const pickStatus = (value: string) => {
        setStatus(value);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Orders</h1>
                <p className="text-sm text-muted-foreground">{data?.pagination.total ?? 0} found</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {STATUSES.map((value) => (
                    <Button key={value} size="sm" variant={status === value ? "default" : "outline"} onClick={() => pickStatus(value)} className="capitalize">
                        {value || "All"}
                    </Button>
                ))}
            </div>

            <form onSubmit={handleSearch} className="flex max-w-md gap-2">
                <Input type="email" placeholder="Buyer's email" aria-label="Buyer's email" value={text} onChange={(e) => setText(e.target.value)} />
                <Button type="submit" size="icon" aria-label="Search">
                    <Search className="h-4 w-4" />
                </Button>
            </form>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <BookLoader />
                </div>
            ) : isError ? (
                <NoData message="Couldn't load the orders" description="Please check your connection and try again." />
            ) : orders.length === 0 ? (
                <NoData message="No orders found" description="Try a different status or email." />
            ) : (
                <Card className="gap-0 py-0 shadow-sm">
                    <CardContent className="overflow-x-auto p-5">
                        <table className="w-full text-left text-sm">
                            <thead className="text-muted-foreground">
                                <tr className="border-b">
                                    <th className="py-2 pr-4 font-medium">Buyer</th>
                                    <th className="py-2 pr-4 font-medium">Total</th>
                                    <th className="py-2 pr-4 font-medium">Payment</th>
                                    <th className="py-2 pr-4 font-medium">Status</th>
                                    <th className="py-2 pr-4 font-medium">Date</th>
                                    <th className="py-2 font-medium">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const isOpen = openId === order._id;
                                    return (
                                        <Fragment key={order._id}>
                                            <tr className="border-b">
                                                <td className="py-2 pr-4">
                                                    <p className="font-medium">{order.buyer?.name ?? "Deleted user"}</p>
                                                    <p className="text-xs text-muted-foreground">{order.buyer?.email}</p>
                                                </td>
                                                <td className="py-2 pr-4">${order.totalAmount.toFixed(2)}</td>
                                                <td className="py-2 pr-4">{order.paymentMethod} · <PaymentBadge status={order.paymentStatus}/></td>
                                                <td className="py-2 pr-4">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[order.orderStatus]}`}>{order.orderStatus}</span>
                                                </td>
                                                <td className="py-2 pr-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="py-2">
                                                    <Button variant="ghost" size="sm" aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? null : order._id)}>
                                                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        {isOpen ? "Hide" : "View"}
                                                    </Button>
                                                </td>
                                            </tr>
                                            {isOpen && (
                                                <tr className="border-b bg-gray-50">
                                                    <td colSpan={6} className="space-y-3 p-4">
                                                        <ul className="space-y-1">
                                                            {order.items.map((item, index) => (
                                                                <li key={index} className="flex flex-wrap justify-between gap-2">
                                                                    <span>{item.title} <span className="text-muted-foreground">by {item.seller?.name ?? "Deleted user"}</span></span>
                                                                    <span className="capitalize">${item.price.toFixed(2)} · {item.status}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <p className="text-muted-foreground">
                                                            Ship to: {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.country}
                                                        </p>
                                                        <p>
                                                            <Link href={`/admin/orders/${order._id}`} className="font-medium text-orange-700 hover:underline">Open order page</Link>
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            <Pagination currentPage={page} totalPages={data?.pagination.pages ?? 0} onPageChange={setPage} />
        </div>
    );
}