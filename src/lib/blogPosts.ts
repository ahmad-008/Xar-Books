export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readMinutes: number;
    image: string;
    sections: { heading?: string; paragraphs: string[] }[];
}

export const blogPosts: BlogPost[] = [
    {
        slug: "how-to-price-used-books",
        title: "How to Price Your Used Books So They Sell",
        excerpt: "A simple way to pick a price that's fair to buyers and still worth your time.",
        date: "2026-11-10",
        readMinutes: 4,
        image: "/images/book1.jpg",
        sections: [
            {
                paragraphs: [
                    "The right price is the difference between a book that sells in a day and one that sits in your listings for months. You don't need a spreadsheet to get it right, just a few quick checks.",
                ],
            },
            {
                heading: "Start from the cover price",
                paragraphs: [
                    "On Xar Books you enter two prices: the original price and your selling price. Buyers see both, so they can tell how much they save. As a rough guide, books in Excellent condition sell well at 50 to 60% of the cover price, Good at 35 to 50%, and Fair at 20 to 35%.",
                ],
            },
            {
                heading: "Check what's already listed",
                paragraphs: [
                    "Search for your title before you list it. If three other copies are on sale, the cheapest one in a similar condition will usually sell first. Pricing just below it, or matching it with better photos, gets you noticed.",
                ],
            },
            {
                heading: "Don't forget shipping",
                paragraphs: [
                    "Buyers see the shipping charge at checkout, and a high one can put them off. Weigh the book, check your courier's rates, and keep the shipping charge close to what it really costs you.",
                ],
            },
            {
                heading: "Adjust if it doesn't sell",
                paragraphs: [
                    "If a book hasn't sold after a couple of weeks, lower the price a little from My Listings. Small drops are often enough to move a book that's close to the right price.",
                ],
            },
        ],
    },
    {
        slug: "grading-book-condition",
        title: "Excellent, Good or Fair? Grading Your Book's Condition",
        excerpt: "Honest grading means happy buyers and fewer cancelled orders. Here's how to choose.",
        date: "2026-11-05",
        readMinutes: 3,
        image: "/images/book2.jpg",
        sections: [
            {
                paragraphs: [
                    "Every listing on Xar Books has a condition. Buyers rely on it to decide, so getting it right protects your reputation and saves everyone the hassle of a cancelled order.",
                ],
            },
            {
                heading: "Excellent",
                paragraphs: [
                    "Looks almost new. The spine is straight, the cover has no creases or stains, and the pages are clean, with no writing or highlighting.",
                ],
            },
            {
                heading: "Good",
                paragraphs: [
                    "Clearly read, but well looked after. Expect light wear on the cover and edges, and maybe a few pencil notes or a name inside the cover. All pages are present and readable.",
                ],
            },
            {
                heading: "Fair",
                paragraphs: [
                    "Well used, but complete. There may be highlighting, a worn or creased cover, or loose binding. Still perfectly usable for study or reading.",
                ],
            },
            {
                heading: "When in doubt, grade down",
                paragraphs: [
                    "A buyer who expected Good and received Excellent is delighted. The opposite leads to complaints. Mention any marks in the description and show them in your photos.",
                ],
            },
        ],
    },
    {
        slug: "why-buy-used-textbooks",
        title: "Five Reasons to Buy Used Textbooks",
        excerpt: "Save money, help the planet, and keep good books in use.",
        date: "2026-10-28",
        readMinutes: 3,
        image: "/images/book3.jpg",
        sections: [
            {
                paragraphs: [
                    "New textbooks are expensive, and most are only needed for a term or a year. Buying used makes a lot of sense. Here's why.",
                ],
            },
            {
                heading: "1. You save a lot",
                paragraphs: ["Used books often cost half the cover price or less, and the content is exactly the same."],
            },
            {
                heading: "2. It's better for the planet",
                paragraphs: ["Every book that gets a second reader is one less book printed, shipped and thrown away."],
            },
            {
                heading: "3. Notes can help",
                paragraphs: ["A little highlighting from a previous student can point you to the parts that matter most."],
            },
            {
                heading: "4. You can sell it again",
                paragraphs: ["When you're done, list it on Xar Books and get some of your money back."],
            },
            {
                heading: "5. Older editions are often fine",
                paragraphs: ["Check with your teacher, but many courses work well with the previous edition, which costs much less."],
            },
        ],
    },
];

export const findBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug);

export const formatPostDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
