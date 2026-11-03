import type { Metadata } from "next";
import ComingSoon from "@/app/components/ComingSoon";

export const metadata: Metadata = {
  title: "My Profile | Xar Books",
};

export default function ProfilePage() {
  return (
    <ComingSoon
      title="My Profile"
      description="Soon you'll be able to view and edit your profile here."
    />
  );
}
