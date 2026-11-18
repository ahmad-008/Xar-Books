import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { blogPosts, findBlogPost, formatPostDate } from "@/lib/blogPosts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export const generateStaticParams = () => blogPosts.map((post) => ({ slug: post.slug }));

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const post = findBlogPost((await params).slug);
  return post ? { title: `${post.title} | Xar Books`, description: post.excerpt } : {};
};

export default async function BlogPostPage({ params }: Props) {
  const post = findBlogPost((await params).slug);
  if (!post) notFound();

  const others = blogPosts.filter((other) => other.slug !== post.slug);

  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <article className="container mx-auto max-w-3xl px-4">
        <Link href="/blogs" className="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>

        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <p className="mb-8 text-gray-500">
          {formatPostDate(post.date)} · {post.readMinutes} min read
        </p>

        <Image
          src={post.image}
          alt=""
          width={1200}
          height={600}
          priority
          sizes="(min-width: 768px) 768px, 100vw"
          className="mb-10 h-64 w-full rounded-lg object-cover shadow-md sm:h-80"
        />

        <div className="rounded-lg bg-white p-6 shadow-lg sm:p-10">
          {post.sections.map((section, index) => (
            <section key={section.heading ?? index}>
              {section.heading && <h2 className="mb-3 mt-8 text-2xl font-semibold first:mt-0">{section.heading}</h2>}
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mb-4 leading-relaxed text-gray-700">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">More posts</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {others.map((other) => (
              <Link key={other.slug} href={`/blogs/${other.slug}`} className="rounded-lg bg-white p-5 shadow transition-shadow hover:shadow-lg">
                <h3 className="font-semibold">{other.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{other.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
