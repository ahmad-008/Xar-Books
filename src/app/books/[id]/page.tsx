"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, LoaderCircle, ShoppingCart, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { howItWorks } from "@/lib/Constant";
import { useAddToCartMutation, useAddToWishlistMutation, useGetCartQuery, useGetProductQuery, useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/store/api";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RootState } from "@/store/store";
import { toggleLoginDialog } from "@/store/slice/userSlice";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { BookLoader } from "@/lib/BookLoader";
import NoData from "@/app/components/NoData";
import ShareButton from "@/app/components/ShareButton";






const BookDetailsPage = () => {

    const { id } = useParams<{ id: string }>();
    const [selectedImage, setSelectedImage] = useState(0);
    


    const { data, isLoading } = useGetProductQuery(id);
    const book = data?.data;
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const { data: cart } = useGetCartQuery(undefined, { skip: !user });
    const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
    const {data: wishlist} = useGetWishlistQuery(undefined, {skip: !user});
    const [addToWishlist, {isLoading: isAddingWish}] = useAddToWishlistMutation();
    const [removeFromWishlist, { isLoading: isRemovingWish }] = useRemoveFromWishlistMutation();
    const isSavingWishlist = isAddingWish || isRemovingWish;


    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center" >
                <BookLoader />
            </div>
        );
    }

    if (!book) {
        return (
            <NoData
                message="Book not found"
                description="The book you are looking for doesn't exist or has been removed."
            />
        );
    }


    const sellerId = typeof book.seller === "object" ? book.seller._id : book.seller;
    const isOwnBook = user?.id === sellerId;
    const inCart = cart?.data.some((item) => item._id === book._id) ?? false;

    const handleAddToCart = async () => {
        if (!user) {
            dispatch(toggleLoginDialog());
            return;
        }
        try {
            const result = await addToCart(book._id).unwrap();
            toast.success(result.message ?? "Added to cart");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const isWishlisted = wishlist?.data.some((item) => item._id === book._id) ?? false;

    const handleToggleWishlist = async () => {
        if (!user) {
            dispatch(toggleLoginDialog());
            return;
        }
        try {
            const result = isWishlisted
                ? await removeFromWishlist(book._id).unwrap()
                : await addToWishlist(book._id).unwrap();
            toast.success(result.message ?? "Wishlist updated");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const images = book.images.length > 0 ? book.images : ["/images/no-book.jpg"];


    const discount =
        book.price > book.finalPrice
            ? Math.round(((book.price - book.finalPrice) / book.price) * 100)
            : 0;

    const details = [
        { label: "Author", value: book.author },
        { label: "Subject", value: book.subject },
        { label: "Category", value: book.category },
        { label: "Class", value: book.classType },
        { label: "Condition", value: book.condition },
        { label: "Edition", value: book.edition },
    ].filter((item) => item.value);

    return (
        <div className="min-h-screen bg-gray-50" >
            <div className="container mx-auto px-4 py-8" >

                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" >
                    <Link href='/' className="hover:text-primary" >Home</Link>
                    <span>/</span>
                    <Link href="/books" className="hover:text-primary">Books</Link>
                    <span>/</span>
                    <span className="text-gray-900">{book.title}</span>

                </nav>


                <div className="grid gap-8 md:grid-cols-2" >
                    {/* Image gallery */}
                    <div className="space-y-4" >
                        <div className="relative h-100 overflow-hidden rounded-xl bg-white shadow-md" >
                            <Image
                                src={images[selectedImage]}
                                alt={book.title}
                                fill
                                sizes="(min-width: 768px) 50vw, 100vw"
                                loading="eager"
                                className="object-contain"
                            />
                            {discount > 0 && (
                                <span className="absolute left-0 top-4 rounded-r-lg bg-red-500 px-3 py-1 text-sm font-medium text-white">
                                    {discount}% Off
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {images.map((image, index) => (
                                <button
                                    key={image}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition
                                        ${selectedImage === index ? "border-orange-500"
                                            : "border-transparent opacity-60 hover:opacity-100"
                                        } `}
                                >
                                    <Image
                                        src={image}
                                        alt={`${book.title} ${index + 1}`}
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                    />



                                </button>
                            ))



                            }

                        </div>


                    </div>

                    {/* Main info */}
                    <div className="space-y-6" >
                        <div className="flex items-center justify-between gap-4" >
                            <div>
                                <h1 className="mb-2 text-3xl font-bold" >{book.title}</h1>
                                <p className="text-sm text-muted-foreground" >
                                    Posted {formatDistanceToNow(new Date(book.createdAt), { addSuffix: true })}
                                </p>

                            </div>
                            <div className="flex gap-2" >
                                <ShareButton title={book.title} />
                                <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={handleToggleWishlist}
                                    disabled={isOwnBook || isSavingWishlist || (book.isSold && !isWishlisted)}
                                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                    aria-pressed={isWishlisted}
                                >
                                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500 " : ""}`} />
                                </Button>

                            </div>

                        </div>

                        <div>
                            <div className="flex items-baseline gap-3" >
                                <span className="text-3xl font-bold" >${book.finalPrice}</span>
                                {book.price > book.finalPrice && (
                                    <span className="text-lg text-muted-foreground line-through" >${book.price}</span>
                                )

                                }
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground" >
                                {book.shippingCharge > 0 ? `+ $${book.shippingCharge} shipping` : "Free shipping"}
                            </p>
                        </div>

                        {inCart ? (
                            <Button asChild size='lg' variant="outline" className="w-full rounded-md normal-case tracking-normal">
                                <Link href="/checkout/cart">
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    In your cart · Go to cart
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                size='lg'
                                onClick={handleAddToCart}
                                disabled={book.isSold || isOwnBook || isAdding}
                                className="w-full rounded-md bg-linear-to-r from-orange-500 to-orange-600 normal-case tracking-normal text-white hover:from-orange-600 hover:to-orange-700 "
                            >
                                {isAdding ? (
                                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                )}
                                {book.isSold ? "Sold out" : isOwnBook ? "This is your listing" : "Add to cart"}
                            </Button>
                        )}


                        {/* Book details */}
                        <Card className="gap-0 rounded-xl py-0 shadow-md" >
                            <CardContent className="p-6" >
                                <h2 className="mb-4 text-lg font-semibold" >Book Details</h2>
                                <dl className="grid grid-cols-2 gap-4" >
                                    {details.map((item) => (
                                        <div key={item.label}>
                                            <dt className="text-sm text-muted-foreground">{item.label}</dt>
                                            <dd className="font-medium" >{item.value}</dd>
                                        </div>
                                    ))

                                    }
                                </dl>
                            </CardContent>
                        </Card>


                    </div>



                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2" >
                    <Card className="gap-0 rounded-xl py-0 shadow-md" >
                        <CardContent className="p-6" >
                            <h2 className="mb-4 text-lg font-semibold">Description</h2>
                            <p className="whitespace-pre-line text-gray-600">{book.description || "No description provided."}</p>
                        </CardContent>
                    </Card>

                    <Card className="gap-0 rounded-xl py-0 shadow-md">
                        <CardContent className="p-6">
                            <h2 className="mb-4 text-lg font-semibold">Sold By</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                    <User2 className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-medium">{typeof book.seller === "object" ? book.seller.name : "Seller"}</p>
                                    <Badge variant="secondary" className="mt-1">Verified Seller</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <section className="mt-12">
                    <h2 className="mb-8 text-center text-2xl font-bold">How does it work?</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {howItWorks.map((item) => (
                            <Card key={item.step} className="gap-0 rounded-xl py-0 text-center shadow-md">
                                <CardContent className="flex flex-col items-center p-6">
                                    <Badge className="mb-4">{item.step}</Badge>
                                    <Image
                                        src={item.image.src}
                                        alt={item.image.alt}
                                        width={80}
                                        height={80}
                                        className="mb-4"
                                    />
                                    <h3 className="mb-2 font-semibold">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>



        </div>





    );
};

export default BookDetailsPage;