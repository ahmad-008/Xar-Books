import type { Metadata } from "next";
import MyListings from "@/app/components/MyListings";

export const metadata: Metadata = {
  title: "My Listings | Xar Books",
};

export default function SellingProductsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <MyListings />
    </div>
  );
}
