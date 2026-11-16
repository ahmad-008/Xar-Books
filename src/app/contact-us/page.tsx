import type { Metadata } from "next";
import ComingSoon from "@/app/components/ComingSoon";

export const metadata: Metadata = {
  title: "Contact Us | Xar Books",
};

export default function ContactUsPage() {
  return (
    <ComingSoon
      title="Contact Us"
      description="A contact form is on its way. Until then, email us at support@xarbooks.com."
    />
  );
}
