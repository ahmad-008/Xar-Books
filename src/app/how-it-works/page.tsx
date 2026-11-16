import type { Metadata } from "next";
import ComingSoon from "@/app/components/ComingSoon";

export const metadata: Metadata = {
  title: "How It Works | Xar Books",
};

export default function HowItWorksPage() {
  return (
    <ComingSoon
      title="How It Works"
      description="A step-by-step guide to buying and selling books on Xar Books is on its way."
    />
  );
}
