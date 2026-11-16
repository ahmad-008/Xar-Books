import type { Metadata } from "next";
import MyOrdersContent from "@/app/components/MyOrdersContent";

export const metadata: Metadata = {
  title: "My Orders | Xar Books",
};

export default function MyOrdersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <MyOrdersContent />
    </div>
  );
}
