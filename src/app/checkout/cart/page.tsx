import type { Metadata } from "next";
import CartContent from "@/app/components/CartContent";

export const metadata: Metadata = {
  title: "Your Cart | Xar Books",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <CartContent />
    </div>
  );
}
