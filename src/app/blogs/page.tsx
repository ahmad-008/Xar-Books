import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { blogPosts, formatPostDate } from "@/lib/blogPosts";

export const metadata: Metadata = {
  title: "Blogs | Xar Books",
  description: "Tips for buying and selling used books on Xar Books.",
};

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="mb-4 text-center text-4xl font-bold">Blogs</h1>
        <p className="mb-12 text-center text-lg text-gray-600">Tips for buying and selling used books.</p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="group overflow-hidden rounded-lg bg-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              <Image
                src={post.image}
                alt=""
                width={600}
                height={400}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <p className="mb-2 text-sm text-gray-500">
                  {formatPostDate(post.date)} · {post.readMinutes} min read
                </p>
                <h2 className="mb-2 text-xl font-semibold group-hover:text-primary">{post.title}</h2>
                <p className="text-gray-600">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
