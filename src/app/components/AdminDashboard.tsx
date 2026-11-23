"use client";

import { useSelector } from "react-redux";
import { BookOpen, DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BookLoader } from "@/lib/BookLoader";
import { STATUS_STYLES } from "@/lib/orderStatus";
import { useGetAdminStatsQuery } from "@/store/api";
import { RootState } from "@/store/store";
import LoginRequired from "./LoginRequired";
import NoData from "./NoData";

export default function AdminDashboard() {
    const user = useSelector((state: RootState) => state.user.user);
    const isAdmin = user?.role === "admin";
    const { data, isLoading, isError } = useGetAdminStatsQuery(undefined, {
        skip: !isAdmin,
        refetchOnMountOrArgChange: true,
    });

    if (!user) {
        return <LoginRequired title="Admin Dashboard" message="Log in with an admin account to see the dashboard." />;
    }

    if (!isAdmin) {
        return <NoData message="Admins only" description="Your account doesn't have access to this page." />
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <BookLoader />
            </div>
        );
    }

    if (isError || !data) {
        return <NoData message="Couldn't load the dashboard" description="Please check your connection and try again." />
    }

    const stats = data.data;
    const cards = [
        { label: "Users", value: stats.users, icon: Users },
        { label: "Books for sale", value: stats.booksForSale, icon: BookOpen },
        { label: "Books sold", value: stats.booksSold, icon: ShoppingBag },
        { label: "Orders", value: stats.orders, icon: Package },
        { label: "Revenue (paid orders)", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map(({ label, value, icon: Icon }) => (
                    <Card key={label} className="gap-0 py-0 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{label}</p>
                                <p className="text-2xl font-bold">{value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="gap-0 py-0 shadow-sm">
                <CardContent className="space-y-3 p-5">
                    <h2 className="font-semibold">Orders by status</h2>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                            <span
                                key={status}
                                className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${STATUS_STYLES[status as keyof typeof STATUS_STYLES]}`}
                            >
                                {status}: {count}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="gap-0 py-0 shadow-sm">
                <CardContent className="space-y-3 p-5" >
                    <h2 className="font-semibold" >Recent orders</h2>
                    {stats.recentOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No orders yet.</p>
                    ) : (
                        <div className="overflow-x-auto" >
                            <table className="w-full text-left text-sm">
                                <thead className="text-muted-foreground">
                                    <tr className="border-b">
                                        <th className="py-2 pr-4 font-medium">Buyer</th>
                                        <th className="py-2 pr-4 font-medium">Total</th>
                                        <th className="py-2 pr-4 font-medium">Payment</th>
                                        <th className="py-2 pr-4 font-medium">Status</th>
                                        <th className="py-2 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map((order) => (
                                        <tr key={order._id} className="border-b last:border-0">
                                            <td className="py-2 pr-4">
                                                <p className="font-medium">{order.buyer?.name ?? "Deleted user"}</p>
                                                <p className="text-xs text-muted-foreground">{order.buyer?.email}</p>
                                            </td>
                                            <td className="py-2 pr-4">${order.totalAmount.toFixed(2)}</td>
                                            <td className="py-2 pr-4">${order.paymentMethod}</td>
                                            <td className="py-2 pr-4">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[order.orderStatus]}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>

                                        </tr>
                                    ))

                                    }
                                </tbody>
                            </table>
                        </div>
                    )

                    }
                </CardContent>
            </Card>

                        

            <Card className="gap-0 py-0 shadow-sm">
                <CardContent className="space-y-3 p-5">
                    <h2 className="font-semibold">New users</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-muted-foreground">
                                <tr className="border-b">
                                    <th className="py-2 pr-4 font-medium">Name</th>
                                    <th className="py-2 pr-4 font-medium">Email</th>
                                    <th className="py-2 pr-4 font-medium">Role</th>
                                    <th className="py-2 font-medium">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentUsers.map((u) => (
                                    <tr key={u._id} className="border-b last:border-0">
                                        <td className="py-2 pr-4 font-medium">{u.name}</td>
                                        <td className="py-2 pr-4">{u.email}</td>
                                        <td className="py-2 pr-4">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${u.role === "admin" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );


}