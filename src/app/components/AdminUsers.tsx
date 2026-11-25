"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookLoader } from "@/lib/BookLoader";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { AdminUser, useGetAdminUsersQuery, useSetUserBlockedMutation } from "@/store/api";
import NoData from "./NoData";
import Pagination from "./Pagination";

export default function AdminUsers() {
    const [text, setText] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useGetAdminUsersQuery({ search, page }, { refetchOnMountOrArgChange: true });
    const [setUserBlocked, { isLoading: isSaving }] = useSetUserBlockedMutation();

    const users = data?.data ?? [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(text.trim());
        setPage(1);
    };

    const handleBlock = async (user: AdminUser) => {
        const blocked = !user.isBlocked;
        if (!window.confirm(`${blocked ? "Block" : "Unblock"} ${user.name}?`)) return;
        try {
            const result = await setUserBlocked({ id: user._id, blocked }).unwrap();
            toast.success(result.message ?? "Saved");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="text-sm text-muted-foreground">{data?.pagination.total ?? 0} found</p>
            </div>

            <form onSubmit={handleSearch} className="flex max-w-md gap-2">
                <Input placeholder="Name or email" aria-label="Search users" value={text} onChange={(e) => setText(e.target.value)} />
                <Button type="submit" size="icon" aria-label="Search">
                    <Search className="h-4 w-4" />
                </Button>
            </form>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <BookLoader />
                </div>
            ) : isError ? (
                <NoData message="Couldn't load the users" description="Please check your connection and try again." />
            ) : users.length === 0 ? (
                <NoData message="No users found" description="Try a different search." />
            ) : (
                <Card className="gap-0 py-0 shadow-sm">
                    <CardContent className="overflow-x-auto p-5">
                        <table className="w-full text-left text-sm">
                            <thead className="text-muted-foreground">
                                <tr className="border-b">
                                    <th className="py-2 pr-4 font-medium">User</th>
                                    <th className="py-2 pr-4 font-medium">Role</th>
                                    <th className="py-2 pr-4 font-medium">Email</th>
                                    <th className="py-2 pr-4 font-medium">Joined</th>
                                    <th className="py-2 pr-4 font-medium">Status</th>
                                    <th className="py-2 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="border-b last:border-0">
                                        <td className="py-2 pr-4">
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </td>
                                        <td className="py-2 pr-4 capitalize">{user.role}</td>
                                        <td className="py-2 pr-4">{user.isEmailVerified ? "Verified" : "Not verified"}</td>
                                        <td className="py-2 pr-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="py-2 pr-4">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-800"}`}>{user.isBlocked ? "Blocked" : "Active"}</span>
                                        </td>
                                        <td className="py-2">
                                            {user.role === "user" && (
                                                <Button variant="outline" size="sm" disabled={isSaving} onClick={() => handleBlock(user)}>
                                                    {user.isBlocked ? "Unblock" : "Block"}
                                                </Button>
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