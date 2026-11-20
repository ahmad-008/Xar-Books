import type { Metadata } from "next";
import Link from "next/link";
import { BookX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found | Xar Books",
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
        <BookX className="mx-auto h-12 w-12 text-orange-500" />
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-md normal-case tracking-normal">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-md normal-case tracking-normal">
            <Link href="/books">Browse books</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
