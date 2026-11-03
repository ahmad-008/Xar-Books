import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Xar Books",
  description: "How Xar Books collects, uses and protects your information.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information from you when you register on our site or place an order. This includes your name, email address, mailing address and phone number. Card payments are handled by Stripe, and we never store your card details.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use the information we collect to process transactions, improve our website, and send periodic emails regarding your order or other products and services.",
  },
  {
    title: "3. Sharing Your Information",
    content:
      "We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent.",
  },
  {
    title: "4. Security of Your Information",
    content:
      "We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.",
  },
  {
    title: "5. Changes to Our Privacy Policy",
    content:
      "We may update this privacy policy periodically. We will notify you about significant changes by sending a notice to the email address in your account or by placing a prominent notice on our site.",
  },
  {
    title: "6. Contact Us",
    content:
      "If you have any questions about this privacy policy or our practices regarding your personal information, please contact us at support@xarbooks.com.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-center text-4xl font-bold">Privacy Policy</h1>
        <p className="mb-4 text-gray-600">
          At Xar Books, we are committed to protecting your privacy. This privacy policy explains how
          we collect, use, and disclose your information.
        </p>

        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mt-6 text-2xl font-semibold">{section.title}</h2>
            <p className="mb-4 text-gray-600">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
