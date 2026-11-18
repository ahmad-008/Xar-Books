import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Camera, CreditCard, PackageCheck, RotateCcw, Search, ShoppingCart, Truck, UserPlus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it Works | Xar Books",
  description: "How buying and selling used books works on Xar Books, step by step.",
};

const buying = [
  { icon: Search, title: "Find a book", text: "Search by title or author, then filter by category, condition and class." },
  { icon: ShoppingCart, title: "Add to cart", text: "Every listing is a single copy, so add it before someone else does." },
  { icon: CreditCard, title: "Check out", text: "Pay securely by card through Stripe, or choose cash on delivery." },
  { icon: Truck, title: "Track your order", text: "Follow each book in My Orders as the seller marks it shipped and delivered." },
];

const selling = [
  { icon: UserPlus, title: "Create an account", text: "Sign up and verify your email address." },
  { icon: Camera, title: "List your book", text: "Add photos, the condition, your price and the shipping charge." },
  { icon: PackageCheck, title: "Ship it", text: "When a book sells, it appears in My Sales with the buyer's address. Mark it shipped, then delivered." },
  { icon: Wallet, title: "Sale complete", text: "Once the buyer has the book, the sale is done. Questions about payouts? Contact us." },
];

const promises = [
  { icon: BadgeCheck, title: "Honest listings", text: "Sellers grade every book as Excellent, Good or Fair, and listings show real photos." },
  { icon: RotateCcw, title: "Easy cancellations", text: "Cancel from My Orders until your books ship. Card payments are refunded automatically." },
  { icon: CreditCard, title: "Safe payments", text: "Card details go straight to Stripe. Xar Books never sees or stores them." },
];

const Steps = ({ title, steps }: { title: string; steps: typeof buying }) => (
  <section className="rounded-lg bg-white p-6 shadow-lg sm:p-8">
    <h2 className="mb-6 text-2xl font-bold">{title}</h2>
    <ol className="space-y-6">
      {steps.map(({ icon: Icon, title: stepTitle, text }, index) => (
        <li key={stepTitle} className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">
              {index + 1}. {stepTitle}
            </h3>
            <p className="text-gray-600">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="mb-4 text-center text-4xl font-bold">How it Works</h1>
        <p className="mb-12 text-center text-lg text-gray-600">
          Buy used books for less, or give the books on your shelf a second life.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <Steps title="Buying" steps={buying} />
          <Steps title="Selling" steps={selling} />
        </div>

        <section className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold">Our Promise</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {promises.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg bg-white p-6 text-center shadow-lg">
                <Icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-16 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="rounded-md normal-case tracking-normal">
            <Link href="/books">Browse Books</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-md normal-case tracking-normal">
            <Link href="/book-sell">Sell a Book</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
