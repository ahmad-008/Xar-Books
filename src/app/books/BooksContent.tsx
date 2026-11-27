"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { filters } from "@/lib/Constant";
import { ProductFilters, useGetProductsQuery } from "@/store/api";
import { BookLoader } from "@/lib/BookLoader";
import { discountPercent } from "@/lib/discount";
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

const BOOKS_PER_PAGE = 12;

const filterGroups: { key: FilterKey; label: string }[] = [
    { key: "condition", label: "Condition" },
    { key: "classType", label: "Class Type" },
    { key: "category", label: "Category" },
];

const SORT_OPTIONS = ["newest", "price-asc", "price-desc"];

const BooksContent = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchTerm = (searchParams.get("search") || "").trim().toLowerCase();
    const sortParam = searchParams.get("sort") || "";
    const sortOption = SORT_OPTIONS.includes(sortParam) ? sortParam : "newest";
    const currentPage = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));

    const selectedFilters = Object.fromEntries(
        filterGroups.map(({ key }) => [key, searchParams.getAll(key).filter((value) => filters[key].includes(value))])
    ) as Record<FilterKey, string[]>;

    const updateUrl = (change: (params: URLSearchParams) => void) => {
        const params = new URLSearchParams(searchParams.toString());
        change(params);
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    const toggleFilter = (key: FilterKey, value: string) => {
        updateUrl((params) => {
            const values = params.getAll(key);
            params.delete(key);
            const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
            next.forEach((v) => params.append(key, v));
            params.delete("page");
        });
    };

    const setSort = (value: string) => {
        updateUrl((params) => {
            if (value === "newest") params.delete("sort");
            else params.set("sort", value);
            params.delete("page");
        });
    };

    const setPage = (page: number) => {
        updateUrl((params) => {
            if (page <= 1) params.delete("page");
            else params.set("page", String(page));
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const { data, isLoading, isFetching, isError } = useGetProductsQuery({
        search: searchTerm || undefined,
        ...selectedFilters,
        sort: sortOption as ProductFilters["sort"],
        page: currentPage,
        limit: BOOKS_PER_PAGE,
    });

    const products = data?.data ?? [];
    const total = data?.pagination?.total ?? 0;
    const totalPages = data?.pagination?.pages ?? 0;

    return (
        <div className="min-h-screen bg-gray-50" >
            <div className="container mx-auto px-4 py-8" >
                <h1 className="mb-8 text-3xl font-bold">Browse used books</h1>


                <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_minmax(0,1fr)]" >
                    {/* Filters sidebar */}
                    <aside className="space-y-4" >
                        <Accordion type="multiple" defaultValue={filterGroups.filter(({key})=> selectedFilters[key].length> 0).map(({key}) => key)}  className="rounded-xl bg-white p-4 shadow-sm" >
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
                    <section className="min-w-0">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3" >
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground" >
                                <span>
                                    {total} {total === 1 ? "book" : "books"} found
                                    {searchTerm && (
                                        <> for <span className="font-semibold text-gray-900">&quot;{searchTerm}&quot;</span></>
                                    )}
                                </span>
                                {searchTerm && (
                                    <Link href="/books" className="text-orange-600 hover:underline">
                                        Clear search
                                    </Link>
                                )}
                            </div>

                            <Select value={sortOption} onValueChange={setSort} >
                                <SelectTrigger className="w-48" >
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                    <SelectItem value="price-desc">Price: High to Low</SelectItem>

                                </SelectContent>

                            </Select>
                        </div>


                        {isLoading ? (
                            <div className="flex justify-center py-16" >
                                <BookLoader />

                            </div>
                        ) : isError ? (
                            <NoData message="Couldn't load books" description="Please check your connection and try again." />
                        ) : products.length > 0 ? (


                            <>
                                <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>

                                    {products.map((book, index) => {
                                        const discount = discountPercent(book.price, book.finalPrice);
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
                                                                width={300}
                                                                height={400}
                                                                sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
                                                                loading={index < 3 ? "eager" : "lazy"}
                                                                className="h-64 w-full bg-gray-100 object-contain p-3"
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
                                                            <Button asChild className="mt-4 w-full rounded-md bg-linear-to-r from-orange-500 to-orange-600 normal-case tracking-normal text-white hover:from-orange-600 hover:to-orange-700" >
                                                                <Link href={`/books/${book._id}`}>View Details</Link>
                                                            </Button>


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
                                    onPageChange={setPage}
                                />


                            </>
                        ) : (
                            <NoData
                                message={searchTerm ? `No books found for "${searchTerm}"` : "No books found"}
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