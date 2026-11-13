import type { Metadata } from "next";
import WishlistContent from "@/app/components/WishlistContent";

export const metadata: Metadata = {
  title: "My Wishlist | Xar Books",
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <WishlistContent />
    </div>
  );
}
