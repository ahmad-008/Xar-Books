"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, LogOut, Store, Package, Users } from "lucide-react";
import { useAdminArea } from "@/lib/useAdminArea";
import { useLogout } from "@/lib/useLogout";
import NoData from "./NoData";
import LoginRequired from "./LoginRequired";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const ADMIN_LINKS = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/books", label: "Books", icon: BookOpen },
    { href: "/admin/orders", label: "Orders", icon: Package },
    {href: "/admin/users", label: "Users", icon: Users},
];
const ITEM = "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition";

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const user = useSelector((state: RootState) => state.user.user);
    const isAdminArea = useAdminArea();
    const handleLogout = useLogout();

     if (!isAdminArea) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-10">
                {user ? (
                    <NoData message="Admins only" description="Your account doesn't have access to this page." />
                ) : (
                    <LoginRequired title="Admin" message="Log in with an admin account to see this page." />
                )

                }
            </main>
        );
     }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
            <aside className="border-b bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
                <div className="px-6 pt-5">
                    <p className="text-lg font-bold">Xar Books</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                </div>
                <nav aria-label="Admin" className="flex gap-1 overflow-x-auto p-3 md:flex-col">
                    {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            aria-current={pathname === href ? "page" : undefined}
                            className={`${ITEM} ${pathname === href ? "bg-orange-100 font-medium text-orange-700" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                            <Icon className="h-5 w-5" />
                            {label}
                        </Link>
                    ))}
                    <Link href="/" className={`${ITEM} text-gray-700 hover:bg-gray-100`}>
                        <Store className="h-5 w-5" />
                        View store
                    </Link>
                    <button type="button" onClick={handleLogout} className={`${ITEM} text-gray-700 hover:bg-gray-100`}>
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </nav>
            </aside>
            <main className="min-w-0 flex-1">{children}</main>
        </div>
    );
}