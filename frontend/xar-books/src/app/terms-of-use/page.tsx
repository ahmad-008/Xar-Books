import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Xar Books",
  description: "The rules and regulations for using Xar Books.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing this website, you accept these terms and conditions in full. If you disagree with any part of these terms, you must not use our website.",
  },
  {
    title: "2. User Responsibilities",
    content:
      "Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.",
  },
  {
    title: "3. Selling Books",
    content:
      "When selling books on Xar Books, you agree to provide accurate and complete information about the books you are listing.",
  },
  {
    title: "4. Changes to Terms",
    content:
      "We may revise these terms from time to time. The revised terms will apply to the use of our website from the date of publication.",
  },
  {
    title: "5. Contact Us",
    content: "If you have any questions about these terms, please contact us at support@xarbooks.com.",
  },
];

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-center text-4xl font-bold">Terms of Use</h1>
        <p className="mb-4 text-gray-600">
          Welcome to Xar Books! These terms and conditions outline the rules and regulations for the
          use of our website.
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
