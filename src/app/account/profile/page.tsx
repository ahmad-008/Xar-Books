import type { Metadata } from "next";
import ProfileContent from "@/app/components/ProfileContent";

export const metadata: Metadata = {
  title: "My Profile | Xar Books",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ProfileContent />
    </div>
  );
}
