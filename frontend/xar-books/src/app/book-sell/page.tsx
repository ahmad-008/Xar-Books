import type { Metadata } from "next";
import ComingSoon from "@/app/components/ComingSoon";

export const metadata: Metadata = {
  title: "Sell Your Books | Xar Books",
};

export default function BookSellPage() {
  return (
    <ComingSoon
      title="Sell Your Books"
      description="Soon you'll be able to list your used books for sale in just a few clicks."
    />
  );
}
