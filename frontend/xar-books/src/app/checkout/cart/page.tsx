import type { Metadata } from "next";
import ComingSoon from "@/app/components/ComingSoon";

export const metadata: Metadata = {
  title: "Your Cart | Xar Books",
};

export default function CartPage() {
  return (
    <ComingSoon
      title="Your Cart"
      description="Shopping cart and secure Stripe checkout are coming soon."
    />
  );
}
