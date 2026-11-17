"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { BookLoader } from "@/lib/BookLoader";
import { useGetProductQuery } from "@/store/api";
import { RootState } from "@/store/store";
import NoData from "./NoData";
import SellBookForm from "./SellBookForm";

export default function EditListingContent() {
    const { id } = useParams<{ id: string }>();
    const user = useSelector((state: RootState) => state.user.user);
    const { data, isLoading, isError } = useGetProductQuery(id, {
        skip: !user,
        refetchOnMountOrArgChange: true,
    });

    if (!user) {
        return <SellBookForm />;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <BookLoader />
            </div>
        );
    }

    const product = data?.data;
    const sellerId = typeof product?.seller === "string" ? product.seller : product?.seller._id;

    if (isError || !product || sellerId !== user.id) {
        return <NoData message="Listing not found" description="This book doesn't exist or isn't yours." />;
    }

    if (product.isSold) {
        return (
            <div className="space-y-4 text-center">
                <NoData message="This book is sold" description="A sold book can't be edited." />
                <Button asChild className="rounded-md normal-case tracking-normal">
                    <Link href="/account/selling-products">Back to my listings</Link>
                </Button>
            </div>
        );
    }

    return <SellBookForm key={product._id} product={product} />;
}
