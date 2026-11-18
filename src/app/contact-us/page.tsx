import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, Package } from "lucide-react";
import ContactForm from "@/app/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Xar Books",
  description: "Questions about an order, a listing or your account? Send the Xar Books team a message.",
};

const info = [
  { icon: Mail, title: "Email", text: "support@xarbooks.com" },
  { icon: Clock, title: "Reply time", text: "Within 2 working days" },
  { icon: Package, title: "Order help", text: "Include your order number so we can find it quickly" },
];

const faqs = [
  {
    question: "How do I cancel an order?",
    answer: (
      <>
        Go to <Link href="/account/orders" className="text-primary hover:underline">My Orders</Link> and press
        Cancel order. You can cancel while every book in the order is still processing. Card payments are refunded
        automatically.
      </>
    ),
  },
  {
    question: "When will I get my refund?",
    answer: "Refunds go back to the card you paid with. Stripe sends them straight away, and most banks show them within 5 to 10 working days.",
  },
  {
    question: "How do I change a listing?",
    answer: (
      <>
        Open <Link href="/account/selling-products" className="text-primary hover:underline">My Listings</Link> and
        press Edit on any book that hasn&apos;t sold yet.
      </>
    ),
  },
  {
    question: "I didn't get the verification email",
    answer: "Check your spam folder first. You can send a new link from the banner at the top of the site while you're logged in.",
  },
];

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="mb-4 text-center text-4xl font-bold">Contact Us</h1>
        <p className="mb-12 text-center text-lg text-gray-600">
          Questions about an order, a listing or your account? Send us a message.
        </p>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-lg lg:col-span-2 sm:p-8">
            <ContactForm />
          </div>

          <div className="space-y-4">
            {info.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-lg bg-white p-5 shadow-lg">
                <Icon className="h-6 w-6 shrink-0 text-primary" />
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="text-sm text-gray-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-16">
          <h2 className="mb-6 text-center text-3xl font-bold">Common Questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-lg bg-white p-6 shadow-lg">
                <h3 className="mb-2 font-semibold">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
