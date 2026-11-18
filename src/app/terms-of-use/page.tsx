import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | Xar Books",
  description: "The rules for buying and selling used books on Xar Books.",
};

const sections = [
  {
    title: "1. About These Terms",
    paragraphs: [
      "These terms apply whenever you use Xar Books, whether you are browsing, buying or selling. By creating an account or placing an order, you agree to them. If you don't agree, please don't use the site.",
    ],
  },
  {
    title: "2. Your Account",
    paragraphs: [
      "You must give a real name and an email address you can access, and verify that email. Keep your password private. You are responsible for everything done through your account.",
      "To protect accounts, we limit repeated login, sign-up and password attempts. If you hit a limit, wait for the time shown and try again.",
    ],
  },
  {
    title: "3. Xar Books Is a Marketplace",
    paragraphs: [
      "Books on Xar Books are listed and sold by individual sellers, not by Xar Books. We provide the platform, take payments for card orders, and help when something goes wrong, but each seller is responsible for their own listings and for shipping their books.",
    ],
  },
  {
    title: "4. Listing a Book",
    paragraphs: [
      "You may only list books you own and can ship. Each listing is one physical copy. Your title, photos, condition grade and description must be accurate, and your photos must be of the actual book.",
      "You can edit a listing until it sells. Don't list counterfeit or pirated copies, or anything that isn't a book. We may remove listings that break these rules.",
    ],
  },
  {
    title: "5. Buying a Book",
    paragraphs: [
      "The price you pay is the selling price of each book plus its shipping charge, as shown at checkout. You can pay by card through Stripe or choose cash on delivery.",
      "A book is reserved for you once your order is placed. If a card payment isn't completed, the order is cancelled and the book goes back on sale.",
    ],
  },
  {
    title: "6. Cancellations and Refunds",
    paragraphs: [
      "You can cancel an order from My Orders while every book in it is still processing. Once any book has shipped, the order can no longer be cancelled online. Contact us instead.",
      "If you paid by card, cancelling refunds the full amount automatically through Stripe. Your bank may take 5 to 10 working days to show it. Cash on delivery orders are never charged until delivery.",
    ],
  },
  {
    title: "7. Sellers' Responsibilities",
    paragraphs: [
      "When your book sells, ship it promptly to the address shown in My Sales, then mark it shipped and, once it arrives, delivered. Only use the buyer's details to complete that order.",
    ],
  },
  {
    title: "8. Things You Must Not Do",
    paragraphs: [
      "Don't use Xar Books to mislead or harass other users, to get around our checkout, or to collect other users' details. Don't try to break into accounts, overload the site or copy its content with automated tools.",
    ],
  },
  {
    title: "9. Ending Your Use",
    paragraphs: [
      "You can stop using Xar Books at any time and ask us to close your account. We may suspend accounts that break these terms.",
    ],
  },
  {
    title: "10. Liability",
    paragraphs: [
      "We work hard to keep Xar Books running and safe, but we provide it as it is. As far as the law allows, we are not responsible for a seller's description of their book, for delays caused by couriers, or for losses that we could not reasonably foresee.",
    ],
  },
  {
    title: "11. Changes to These Terms",
    paragraphs: [
      "We may update these terms as the site changes. The date at the top shows the latest version. If you keep using Xar Books after a change, the new terms apply.",
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-2 text-center text-4xl font-bold">Terms of Use</h1>
        <p className="mb-10 text-center text-sm text-gray-500">Last updated: 18 November 2026</p>

        <div className="rounded-lg bg-white p-6 shadow-lg sm:p-10">
          {sections.map((section) => (
            <section key={section.title} className="mb-8 last:mb-0">
              <h2 className="mb-3 text-2xl font-semibold">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mb-3 leading-relaxed text-gray-600">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section>
            <h2 className="mb-3 text-2xl font-semibold">12. Contact Us</h2>
            <p className="leading-relaxed text-gray-600">
              Questions about these terms? Email support@xarbooks.com or use our{" "}
              <Link href="/contact-us" className="text-primary hover:underline">contact form</Link>. See also our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
