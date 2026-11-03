import type { Metadata } from "next";
import ComingSoon from "@/app/components/ComingSoon";

export const metadata: Metadata = {
  title: "My Selling Orders | Xar Books",
};

export default function SellingProductsPage() {
  return (
    <ComingSoon
      title="My Selling Orders"
      description="Soon you'll be able to manage the books you've listed for sale here."
    />
  );
}
