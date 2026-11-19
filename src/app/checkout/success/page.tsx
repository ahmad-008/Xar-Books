import type { Metadata } from "next";
import CheckoutResult from "@/app/components/CheckoutResult";

export const metadata: Metadata = {
  title: "Payment | Xar Books",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <CheckoutResult sessionId={typeof session_id === "string" ? session_id : ""} />
    </div>
  );
}
