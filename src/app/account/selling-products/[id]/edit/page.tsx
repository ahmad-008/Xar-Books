import type { Metadata } from "next";
import EditListingContent from "@/app/components/EditListingContent";

export const metadata: Metadata = {
  title: "Edit Listing | Xar Books",
};

export default function EditListingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EditListingContent />
    </div>
  );
}
