"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Heart, Package, Receipt } from "lucide-react";
import { categoryLinks } from "@/lib/Constant";
import { RootState } from "@/store/store";

const MAIN_LINKS = [
    { href: "/", label: "Home" },
    { href: "/books", label: "All Books" },
    ...categoryLinks.map((link) => ({
        href: `/books?category=${encodeURIComponent(link.value)}`,
        label: link.label,
    })),
    { href: "/how-it-works", label: "How it works" },
];

const ACCOUNT_LINKS = [
    { href: "/account/orders", label: "My Orders", icon: Package },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/sales", label: "My Sales", icon: Receipt },
];

export default function NavBar() {
    const pathname = usePathname();
    const user = useSelector((state: RootState) => state.user.user);

    const isActive = (href: string) => !href.includes("?") && pathname === href;

    const linkClass = (href: string) =>
        `flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
            isActive(href)
                ? "bg-orange-100 font-medium text-orange-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`;

    return (
        <nav aria-label="Main" className="border-t bg-white">
            <div className="container mx-auto flex items-center gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] lg:w-[80%]">
                {MAIN_LINKS.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={linkClass(link.href)}
                        aria-current={isActive(link.href) ? "page" : undefined}
                    >
                        {link.label}
                    </Link>
                ))}

                {user && (
                    <div className="ml-auto flex shrink-0 items-center gap-1 border-l pl-3">
                        {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={linkClass(href)}
                                aria-current={isActive(href) ? "page" : undefined}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
