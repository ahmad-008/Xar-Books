"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookLoader } from '@/lib/BookLoader';
import { useGetProductsQuery } from '@/store/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';


function NewBooks() {

    const [currentBookSlide, setCurrentBookSlide] = useState(0);
    const { data, isLoading } = useGetProductsQuery({ sort: "newest", limit: 9 });
    const books = data?.data ?? [];


    const slideCount = Math.max(1, Math.ceil(books.length / 3));
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBookSlide((prev) => (prev + 1) % slideCount);
        }, 5000)
        return () => clearInterval(timer)
    }, [slideCount]);

    const prevSlide = () => {
        setCurrentBookSlide((prev) => (prev - 1 + slideCount) % slideCount);
    }
    const nextSlide = () => {
        setCurrentBookSlide((prev) => (prev + 1) % slideCount);
    }


    const calculateDiscount = (price: number, finalPrice: number): number => {
        if (price > finalPrice && price > 0) {
            return Math.round(((price - finalPrice) / price) * 100)
        }
        return 0;
    }

    return (
        <section className='py-16 bg-gray-50'>
            <div className='container mx-auto px-4' >
                <h2 className='text-3xl font-bold text-center mb-12'>Newly Added Books  </h2>
                <div className='relative' >
                    {isLoading ? (
                        <div className='flex justify-center py-8' >
                            <BookLoader />
                        </div>



                    ) : books.length > 0 ? (
                        <>
                            <div className='overflow-hidden' >
                                <div className='flex transition-transform duration-500 ease-in-out'
                                    style={{ transform: `translateX(-${currentBookSlide * 100}%)` }}
                                >
                                    {Array.from({length: slideCount},(_,slideIndex) => (
                                        <div key={slideIndex} className='flex-none w-full' >
                                            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                                {books.slice(slideIndex * 3, slideIndex * 3 + 3).map((book) => (
                                                    <Card key={book._id} className="relative h-full py-0 gap-0 rounded-xl shadow-md transition-shadow hover:shadow-lg">
                                                        <CardContent className='p-4 h-full' >
                                                            <Link href={`/books/${book._id}`} className='block h-full' >
                                                                <div className='relative flex h-full flex-col' >
                                                                    <Image
                                                                        src={book.images[0] || "/images/no-book.jpg"}
                                                                        alt={book.title}
                                                                        width={200}
                                                                        height={300}
                                                                        className='mb-4 h-50 w-full object-cover rounded-md'
                                                                    >
                                                                    </Image>
                                                                    {calculateDiscount(book.price, book.finalPrice) > 0 && (
                                                                        <span className='absolute left-0 top-2 rounded-r-lg bg-red-500 px-2 py-1 text-xs font-medium text-white' >
                                                                            {calculateDiscount(book.price, book.finalPrice)} % Off
                                                                        </span>
                                                                    )}
                                                                    <h3 className='mb-2 line-clamp-2 text-sm font-medium' >
                                                                        {book.title}
                                                                    </h3>
                                                                    <div className='flex items-center justify-between' >
                                                                        <div className='flex items-baseline gap-2' >
                                                                            <span className='text-lg font-bold' >${book.finalPrice}</span>
                                                                            {book.price > book.finalPrice && (
                                                                                <span className='text-sm text-muted-foreground line-through' >${book.price}</span>
                                                                            )}
                                                                        </div>
                                                                        <div className='flex justify-between items-center text-xs text-zinc-400' >
                                                                            <span>{book.condition}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className='mt-auto flex justify-end pt-4' >
                                                                        <Button className="normal-case tracking-normal rounded-md bg-linear-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700" >
                                                                            Buy Now
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                            </Link>
                                                        </CardContent>
                                                    </Card>
                                                ))}

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Scroll Button */}
                            {slideCount > 1 && (
                                <>
                                    <button
                                        className='absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md'
                                        onClick={prevSlide}
                                        aria-label="Previous books"
                                    >
                                        <ChevronLeft className='h-6 w-6' />
                                    </button>
                                    <button
                                        className='absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md'
                                        onClick={nextSlide}
                                        aria-label="Next books"
                                    >
                                        <ChevronRight className='h-6 w-6' />
                                    </button>
                                </>
                            )}

                        </>
                    ) : (
                        <p className='text-center text-gray-500' >No books to display!</p>
                    )}
                </div>

            </div>


        </section>
    )
}

export default NewBooks;