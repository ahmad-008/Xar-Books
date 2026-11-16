import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment received | Xar Books",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
        <CircleCheck className="mx-auto h-12 w-12 text-green-600" />
        <h1 className="text-2xl font-bold">Thank you for your order!</h1>
        <p className="text-gray-600">
          Your payment went through. It can take a few seconds for your order to show as paid.
        </p>
        <Button asChild className="rounded-md normal-case tracking-normal">
          <Link href="/account/orders">View my orders</Link>
        </Button>
      </div>
    </div>
  );
}
