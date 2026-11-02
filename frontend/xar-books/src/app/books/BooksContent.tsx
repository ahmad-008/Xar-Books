"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { books, filters } from "@/lib/Constant";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Pagination from "../components/Pagination";
import NoData from "../components/NoData";


type FilterKey = "condition" | "classType" | "category";

const BOOKS_PER_PAGE = 6;

const filterGroups: { key: FilterKey; label: string }[] = [
    { key: "condition", label: "Condition" },
    { key: "classType", label: "Class Type" },
    { key: "category", label: "Category" },
];

const BooksContent = () => {
    const searchParams = useSearchParams();
    const searchTerm = (searchParams.get("search") || "").toLowerCase();

    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState("newest");
    const [selectedFilters, setSelectedFilters] = useState<Record<FilterKey, string[]>>({
        condition: [],
        classType: [],
        category: [],
    });


    const toggleFilter = (key: FilterKey, value: string) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter((v) => v !== value)
                : [...prev[key], value],
        }));
        setCurrentPage(1);
    }


    const filteredBooks = books.filter((book) => {
        const matchesFilter = (key: FilterKey) =>
            selectedFilters[key].length === 0 || selectedFilters[key].includes(book[key]);


        const matchesSearch =
            !searchTerm ||
            [book.title, book.author, book.category, book.subject].some((field) =>
                field.toLowerCase().includes(searchTerm)
            );

        return matchesFilter("condition") && matchesFilter("classType") && matchesFilter("category") && matchesSearch;

    });


    const sortedBooks = [...filteredBooks].sort((a, b) => {
        switch (sortOption) {
            case "oldest":
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "price-low":
                return a.finalPrice - b.finalPrice;
            case "price-high":
                return b.finalPrice - a.finalPrice;
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();


        }
    });

    const totalPages = Math.ceil(sortedBooks.length / BOOKS_PER_PAGE);
    const paginatedBooks = sortedBooks.slice(
        (currentPage - 1) * BOOKS_PER_PAGE,
        currentPage * BOOKS_PER_PAGE

    );

    const calculateDiscount = (price: number, finalPrice: number) =>
        price > finalPrice && price > 0 ? Math.round(((price - finalPrice) / price) * 100) : 0;

    return (
        <div className="min-h-screen bg-gray-50" >
            <div className="container mx-auto px-4 py-8" >
                <h1 className="mb-8 text-3xl font-bold">Find from over 1000s of used books online</h1>


                <div className="grid gap-8 md:grid-cols-[280px_1fr]" >
                    {/* Filters sidebar */}
                    <aside className="space-y-4" >
                        <Accordion type="multiple" className="rounded-xl bg-white p-4 shadow-sm" >
                            {filterGroups.map(({ key, label }) => (
                                <AccordionItem key={key} value={key}>
                                    <AccordionTrigger className="normal-case">{label}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-2">
                                            {filters[key].map((option) => (
                                                <label key={option} className="flex items-center gap-2 text-sm" >
                                                    <Checkbox
                                                        checked={selectedFilters[key].includes(option)}
                                                        onCheckedChange={() => toggleFilter(key, option)}
                                                    />
                                                    {option}
                                                </label>
                                            ))

                                            }

                                        </div>

                                    </AccordionContent>
                                </AccordionItem>
                            ))

                            }
                        </Accordion>
                    </aside>




                    {/* Books */}
                    <section>
                        <div className="mb-6 flex items-center justify-between" >
                            <p className="text-sm text-muted-foreground" >
                                {sortedBooks.length} {sortedBooks.length === 1 ? "book" : "books"} found
                            </p>

                            <Select value={sortOption} onValueChange={setSortOption} >
                                <SelectTrigger className="w-48" >
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                </SelectContent>

                            </Select>
                        </div>

                        {paginatedBooks.length > 0 ? (
                            <>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" >
                                    {paginatedBooks.map((book, index) => {
                                        const discount = calculateDiscount(book.price, book.finalPrice);
                                        return (
                                            <motion.div
                                                key={book._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >

                                                <Card className="h-full gap-0 overflow-hidden rounded-xl py-0 shadow-md transition-shadow hover:shadow-lg" >
                                                    <CardContent className="flex h-full flex-col p-0">
                                                        <Link
                                                            href={`/books/${book._id}`}
                                                            className="relative block"
                                                        >
                                                            <Image
                                                                src={book.images[0] || "/images/no-book.jpg"}
                                                                alt={book.title}
                                                                width={400}
                                                                height={300}
                                                                loading={index < 3 ? "eager" : "lazy"}
                                                                className="h-56 w-full object-cover"
                                                            />
                                                            {discount > 0 && (
                                                                <span className="absolute left-0 top-2 rounded-r-lg bg-red-500 px-2 py-1 text-xs font-medium text-white" >
                                                                    {discount}% Off
                                                                </span>
                                                            )

                                                            }
                                                        </Link>


                                                        <div className="flex flex-1 flex-col p-4" >
                                                            <h3 className="mb-1 line-clamp-2 font-semibold" >{book.title}</h3>
                                                            <p className="mb-3 text-sm text-muted-foreground">{book.author}</p>
                                                            <div className="mb-3 flex items-baseline gap-2">
                                                                <span className="text-lg font-bold">
                                                                    ${book.finalPrice}
                                                                </span>
                                                                {book.price > book.finalPrice && (
                                                                    <span className="text-sm text-muted-foreground line-through" >${book.price}</span>
                                                                )}
                                                            </div>
                                                            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground" >
                                                                <span>{formatDistanceToNow(new Date(book.createdAt), { addSuffix: true })}</span>
                                                                <span>{book.condition}</span>
                                                            </div>
                                                            <Link
                                                                href={`/books/${book._id}`} className="mt-4"
                                                            >
                                                                <Button className="w-full rounded-md bg-linear-to-r from-orange-500 to-orange-600 normal-case tracking-normal text-white hover:from-orange-600 hover:to-orange-700" >
                                                                    View Details
                                                                </Button>

                                                            </Link>


                                                        </div>


                                                    </CardContent>
                                                </Card>





                                            </motion.div>
                                        );
                                    }

                                    )

                                    }
                                </div>

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />


                            </>
                        ) : (
                            <NoData
                                message="No books found"
                                description="Try changing your filters or search term."
                            />
                        )

                        }




                    </section>




                </div>

            </div>

        </div>
    )
};

export default BooksContent;