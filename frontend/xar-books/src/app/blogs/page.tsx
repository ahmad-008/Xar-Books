import type { Metadata } from "next";
import ComingSoon from "@/app/components/ComingSoon";

export const metadata: Metadata = {
  title: "Blogs | Xar Books",
};

export default function BlogsPage() {
  return (
    <ComingSoon
      title="Blogs"
      description="Tips, guides and stories about buying and selling used books are on their way."
    />
  );
}
