const READING_BOOKS = "Reading Books (Novels, Children, Business, Literature, History, etc.)";
const COLLEGE_BOOKS = "College Books (Higher Education Textbooks)";
const SCHOOL_BOOKS = "School Books (up to 12th)";
const EXAM_BOOKS = "Exam/Test Preparation Books";

export const filters = {
  condition: ["Excellent", "Good", "Fair"],
  category: [COLLEGE_BOOKS, EXAM_BOOKS, READING_BOOKS, SCHOOL_BOOKS],
  classType: [
    "B.Tech", "B.Sc", "B.Com", "BCA", "MCA", "MBA", "M.Tech", "M.Sc", "Ph.D",
    "12th", "11th", "10th", "9th", "8th", "7th", "6th", "5th", "1st-4th",
  ],
};

export const howItWorks = [
  {
    step: "Step 1",
    title: "Seller posts an Ad",
    description: "Seller posts an ad on Xar Books to sell their used books.",
    image: { src: "/icons/ads.png", alt: "Post Ad" },
  },
  {
    step: "Step 2",
    title: "Buyer Pays Online",
    description: "Buyer pays securely online through Stripe to buy the books.",
    image: { src: "/icons/pay_online.png", alt: "Payment" },
  },
  {
    step: "Step 3",
    title: "Seller ships the books",
    description: "Seller then ships the books to the buyer.",
    image: { src: "/icons/fast-delivery.png", alt: "Shipping" },
  },
];

