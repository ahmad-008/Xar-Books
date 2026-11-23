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

export default function AdminDashboard(){
    const user = useSelector((state: RootState) => state.user.user);
    const isAdmin = user?.role === "admin";
    const {data, isLoading, isError} = useGetAdminStatsQuery(undefined,{
        skip: !isAdmin,
        refetchOnMountOrArgChange: true,
    });

    if(!user) {
        return <LoginRequired  title="Admin Dashboard" message="Log in with an admin account to see the dashboard." />;
    }

    if (!isAdmin){
        return <NoData message="Admins only"  description="Your account doesn't have access to this page."/>
    }

    if(isLoading){
        return(
            <div className="flex justify-center py-16">
                <BookLoader/>
            </div>
        );
    }

    if (isError || !data){
        return <NoData message="Couldn't load the dashboard" description="Please check your connection and try again." />
    }

    const stats = data.data;
    const cards = [
        {label: "Users", value: stats.users, icon: Users},
        { label: "Books for sale", value: stats.booksForSale, icon: BookOpen },
        { label: "Books sold", value: stats.booksSold, icon: ShoppingBag },
        { label: "Orders", value: stats.orders, icon: Package },
        {label: "Revenue (paid orders)", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign},
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
        </div>
    );


}