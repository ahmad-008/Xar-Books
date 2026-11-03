import type { Metadata } from "next";
import ComingSoon from "@/app/components/ComingSoon";

export const metadata: Metadata = {
  title: "My Wishlist | Xar Books",
};

export default function WishlistPage() {
  return (
    <ComingSoon
      title="My Wishlist"
      description="Soon you'll be able to save your favourite books here."
    />
  );
}
