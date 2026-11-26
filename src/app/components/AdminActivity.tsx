"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookLoader } from "@/lib/BookLoader";
import { AdminActivity as Activity, useGetAdminActivityQuery } from "@/store/api";
import NoData from "./NoData";
import Pagination from "./Pagination";

const ACTION_TEXT: Record<Activity["action"], string> = {
    remove_book: "Removed a book",
    block_user: "Blocked a user",
    unblock_user: "Unblocked a user",
    cancel_order: "Cancelled an order",
    deliver_order: "Marked an order delivered",
};

export default function AdminActivity() {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useGetAdminActivityQuery(page, { refetchOnMountOrArgChange: true });

    const activity = data?.data ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Activity</h1>
                <p className="text-sm text-muted-foreground">What admins changed, newest first</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <BookLoader />
                </div>
            ) : isError ? (
                <NoData message="Couldn't load the activity" description="Please check your connection and try again." />
            ) : activity.length === 0 ? (
                <NoData message="No activity yet" description="Removing books, blocking users and order actions will show here." />
            ) : (
                <Card className="gap-0 py-0 shadow-sm">
                    <CardContent className="overflow-x-auto p-5">
                        <table className="w-full text-left text-sm">
                            <thead className="text-muted-foreground">
                                <tr className="border-b">
                                    <th className="py-2 pr-4 font-medium">When</th>
                                    <th className="py-2 pr-4 font-medium">Admin</th>
                                    <th className="py-2 pr-4 font-medium">Action</th>
                                    <th className="py-2 font-medium">What</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activity.map((entry) => (
                                    <tr key={entry._id} className="border-b last:border-0">
                                        <td className="py-2 pr-4 whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</td>
                                        <td className="py-2 pr-4">{entry.admin?.name ?? "Deleted admin"}</td>
                                        <td className="py-2 pr-4">{ACTION_TEXT[entry.action]}</td>
                                        <td className="py-2">
                                            {entry.action.endsWith("_order") ? (
                                                <Link href={`/admin/orders/${entry.targetId}`} className="font-medium text-orange-700 hover:underline">{entry.label}</Link>
                                            ) : (
                                                entry.label
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            <Pagination currentPage={page} totalPages={data?.pagination.pages ?? 0} onPageChange={setPage} />
        </div>
    );
}