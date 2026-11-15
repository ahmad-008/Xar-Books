import type { Metadata } from "next";
import CheckoutContent from "@/app/components/CheckoutContent";

export const metadata: Metadata = {
  title: "Checkout | Xar Books",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <CheckoutContent />
    </div>
  );
}
