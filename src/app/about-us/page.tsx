import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | Xar Books",
  description: "Learn about Xar Books, the marketplace to buy and sell used books online.",
};

const values = [
  {
    icon: BookOpen,
    title: "Our Mission",
    description:
      "At Xar Books, we aim to make reading accessible to everyone by providing a platform where people can buy and sell their old books easily.",
  },
  {
    icon: Users,
    title: "Our Community",
    description:
      "We believe in building a community of book lovers who can share their passion for reading while promoting eco-friendly practices.",
  },
  {
    icon: ShieldCheck,
    title: "Our Commitment",
    description:
      "We are committed to providing a secure platform for transactions and ensuring customer satisfaction at every step.",
  },
];

const reasons = [
  { emoji: "📚", title: "Wide Selection", description: "Thousands of used books available at your fingertips." },
  { emoji: "📝", title: "Easy Listing", description: "Sell your old books in just a few clicks." },
  { emoji: "🔒", title: "Secure Transactions", description: "Payments are processed securely through Stripe." },
  { emoji: "🤝", title: "Community Driven", description: "Join a community of readers and sellers who share your passion." },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-4xl font-bold">About Us</h1>
        <p className="mb-12 text-center text-lg text-gray-600">
          Welcome to Xar Books, your ultimate destination for buying and selling used books online.
        </p>

        <div className="mb-12 grid gap-8 md:grid-cols-3">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg bg-white p-8 shadow-lg transition-transform hover:scale-105"
            >
              <div className="mb-4 flex items-center justify-center">
                <Icon className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-4 text-center text-xl font-semibold">{title}</h2>
              <p className="text-center text-gray-600">{description}</p>
            </div>
          ))}
        </div>

        <section className="rounded-lg bg-white py-16">
          <h2 className="mb-8 text-center text-3xl font-bold">Why Choose Xar Books?</h2>
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-lg bg-gray-100 p-6 shadow-lg transition-transform hover:scale-105"
              >
                <div className="mb-4 text-center text-4xl">{reason.emoji}</div>
                <h3 className="mb-2 text-center text-lg font-semibold">{reason.title}</h3>
                <p className="text-center text-gray-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-8 mt-16 grid gap-4 md:grid-cols-2">
          <Image
            src="/images/book1.jpg"
            alt="Books on a shelf"
            width={600}
            height={400}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-72 w-full rounded-lg object-cover shadow-md"
          />
          <Image
            src="/images/book2.jpg"
            alt="Reading a book"
            width={600}
            height={400}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-72 w-full rounded-lg object-cover shadow-md"
          />
        </div>

        <h2 className="mb-4 text-center text-xl font-semibold">Join Us Today!</h2>
        <p className="mb-8 text-center text-lg text-gray-600">
          Sign up now to start buying and selling your favorite books on Xar Books!
        </p>

        <div className="flex justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-lg bg-blue-500 px-6 normal-case tracking-normal text-white hover:bg-blue-600"
          >
            <Link href="/books">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
