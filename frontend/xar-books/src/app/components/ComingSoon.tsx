import Link from "next/link";
import { Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <Hammer className="h-8 w-8 text-orange-600" />
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-600">
          Coming Soon
        </p>
        <h1 className="mb-4 text-3xl font-bold">{title}</h1>
        <p className="mb-8 text-gray-600">
          {description ?? "We're working on this page. Check back soon!"}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="outline" className="rounded-md normal-case tracking-normal">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button
            asChild
            className="rounded-md bg-linear-to-r from-orange-500 to-orange-600 normal-case tracking-normal text-white hover:from-orange-600 hover:to-orange-700"
          >
            <Link href="/books">Browse Books</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
