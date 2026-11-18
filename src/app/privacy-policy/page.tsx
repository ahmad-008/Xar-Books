import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Xar Books",
  description: "What information Xar Books collects, why, and who it is shared with.",
};

const sections = [
  {
    title: "1. Information We Collect",
    items: [
      "Account details: your name, email address and password. Passwords are stored only as a secure hash, so nobody at Xar Books can read them.",
      "Profile details you choose to add: phone number and profile picture.",
      "Listings: the photos and details of books you sell.",
      "Orders: the shipping address and phone number you enter at checkout, the books you bought, and the payment status.",
      "Security data: your IP address, used for a short time to block repeated login, sign-up and password attempts. These records delete themselves within an hour.",
    ],
  },
  {
    title: "2. What We Don't Collect",
    items: [
      "Card details. Card payments are entered directly on Stripe's checkout page. We only receive a payment reference and whether the payment succeeded.",
      "Advertising or tracking cookies. We don't run ads or sell your data.",
    ],
  },
  {
    title: "3. How We Use It",
    items: [
      "To run your account, show your listings and process your orders.",
      "To send emails you need, like verifying your address, resetting your password, and replies to messages you send us.",
      "To keep the site secure and stop abuse.",
    ],
  },
  {
    title: "4. Who Can See It",
    items: [
      "Other users see your name on books you list. They never see your email, phone number or address.",
      "When you buy a book, its seller sees your name, shipping address and phone number so they can send it to you.",
      "We use trusted services to run the site: Stripe (card payments and refunds), Cloudinary (image storage), MongoDB Atlas (database), Vercel (hosting) and Google (sending emails). They only get the data they need to do that job.",
      "We may share information if the law requires it.",
    ],
  },
  {
    title: "5. Cookies and Local Storage",
    items: [
      "We use one essential cookie to keep you logged in. It can't be read by scripts on the page and expires after 1 day.",
      "Your browser also stores whether you're logged in and your basic profile, so the site loads quickly. Logging out clears it.",
    ],
  },
  {
    title: "6. How Long We Keep It",
    items: [
      "We keep your account and listings while your account is open, and order records as long as needed for accounting and to handle disputes.",
      "Email verification and password reset links expire after 24 hours and 15 minutes.",
    ],
  },
  {
    title: "7. Your Choices",
    items: [
      "You can update your name, phone number, picture and password at any time from your Profile page.",
      "You can ask us for a copy of your data, or to delete your account, by contacting us.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    items: ["If we change how we use your information, we'll update this page and the date at the top."],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-2 text-center text-4xl font-bold">Privacy Policy</h1>
        <p className="mb-10 text-center text-sm text-gray-500">Last updated: 18 November 2026</p>

        <div className="rounded-lg bg-white p-6 shadow-lg sm:p-10">
          {sections.map((section) => (
            <section key={section.title} className="mb-8 last:mb-0">
              <h2 className="mb-3 text-2xl font-semibold">{section.title}</h2>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                {section.items.map((item) => (
                  <li key={item} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <h2 className="mb-3 text-2xl font-semibold">9. Contact Us</h2>
            <p className="leading-relaxed text-gray-600">
              Questions about your data? Email support@xarbooks.com or use our{" "}
              <Link href="/contact-us" className="text-primary hover:underline">contact form</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
