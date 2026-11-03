import type { Metadata } from "next";
import ComingSoon from "@/app/components/ComingSoon";

export const metadata: Metadata = {
  title: "My Orders | Xar Books",
};

export default function OrdersPage() {
  return (
    <ComingSoon
      title="My Orders"
      description="Soon you'll be able to track all your orders here."
    />
  );
}
