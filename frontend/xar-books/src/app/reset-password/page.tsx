import type { Metadata } from "next";
import { Suspense } from "react";
import { BookLoader } from "@/lib/BookLoader";
import ResetPasswordContent from "./ResetPasswordContent";

export const metadata: Metadata = {
  title: "Reset Password | Xar Books",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<BookLoader />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
