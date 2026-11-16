import type { Metadata } from "next";
import MySalesContent from "@/app/components/MySalesContent";

export const metadata: Metadata = {
  title: "My Sales | Xar Books",
};

export default function MySalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <MySalesContent />
    </div>
  );
}
