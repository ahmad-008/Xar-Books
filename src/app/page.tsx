"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Camera, CreditCard, Library, Search, ShoppingBag, Store, Tag, Truck, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import NewBooks from "./components/NewBooks";
import { Card, CardContent } from "@/components/ui/card";


const bannerImages = [
  "/images/book1.jpg",
  "/images/book2.jpg",
  "/images/book3.jpg",
];

export default function Home() {

  const blogPosts = [
    {
      imageSrc:
        "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b25saW5lJTIwc2VsbCUyMGJvb2tzfGVufDB8fDB8fHww",
      href: "/blogs/how-to-price-used-books",
      title: "How to price your used books so they sell",
      description:
        "Set a fair price for your old books and sell them faster.",
      icon: <BookOpen className="w-6 h-6 text-primary" />,
    },
    {
      imageSrc:
        "https://media.istockphoto.com/id/910384920/photo/kid-reading-near-locked-door.webp?a=1&b=1&s=612x612&w=0&k=20&c=J3FL4ZVORItw_bkLzlVo4WO-xUy22S7Qqbuq2xusNnc=",
      href: "/blogs/grading-book-condition",
      title: "Excellent, Good or Fair?",
      description:
        "Learn how to grade your book's condition honestly so buyers trust you.",
      icon: <Library className="w-6 h-6 text-primary" />,
    },
    {
      imageSrc:
        "https://images.unsplash.com/photo-1492539438225-2666b2a98f93?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG9sZCUyMCUyMGJvb2tzfGVufDB8fDB8fHww",
      href: "/blogs/why-buy-used-textbooks",
      title: "Why buy used textbooks?",
      description:
        "Five reasons buying used saves you money and is better for the planet.",
      icon: <Store className="w-6 h-6 text-primary" />,
    },
  ];

  const sellSteps = [
    {
      step: "Step 1",
      title: "Post an ad for selling used books",
      description:
        "Post an ad on Xar Books describing your book details to sell your old books online.",
      icon: <Camera className="h-8 w-8 text-primary" />,
    },
    {
      step: "Step 2",
      title: "Set the selling price for your books",
      description: "Set the price for your books at which you want to sell them.",
      icon: <Tag className="h-8 w-8 text-primary" />,
    },
    {
      step: "Step 3",
      title: "Ship the book and get paid",
      description:
        "With cash on delivery, the buyer pays when the book arrives. For card orders, contact us about your payout.",
      icon: <Wallet className="h-8 w-8 text-primary" />,
    },
  ];

  const buySteps = [
    {
      step: "Step 1",
      title: "Select the used books you want",
      description: "Search the used books listed on Xar Books.",
      icon: <Search className="h-8 w-8 text-primary" />,
    },
    {
      step: "Step 2",
      title: "Place the order by making payment",
      description:
        "Add books to your cart and check out by card or cash on delivery.",
      icon: <CreditCard className="h-8 w-8 text-primary" />,
    },
    {
      step: "Step 3",
      title: "Get the books delivered at your doorstep",
      description: "The books will be delivered to you at your doorstep!",
      icon: <Truck className="h-8 w-8 text-primary" />,
    },
  ];

  const [currentImage, setCurrentImage] = useState(0)
  useEffect(() => {
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bannerImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="min-h-screen" >
      <section className="relative h-150 overflow-hidden" >
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${currentImage === index ? 'opacity-100' : 'opacity-0'} `}
          >

            <Image
              src={image}
              alt='banner'
              fill
              sizes="100vw"
              className="object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
            <div className="absolute inset-0 bg-black/50" />

          </div>
        ))}

        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-white text-center" >
          <h1 className="text-4xl md:text-6xl font-bold mb-8" >
            Buy and Sell Books Online
          </h1>
          <div className="flex flex-col sm:flex-row gap-6">
            <Button size='lg'
              asChild
              className="group bg-linear-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-8 rounded-lg normal-case tracking-normal"
            >
              <Link href='/books' >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors" >
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <span className="font-semibold">Buy Books</span>
                </div>
              </Link>
            </Button>


            <Button size='lg'
              asChild
              className="group bg-linear-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-8 rounded-lg normal-case tracking-normal"
            >
              <Link href='/book-sell' >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors" >
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <span className="font-semibold">Sell Books</span>
                </div>
              </Link>
            </Button>

          </div>

        </div>


      </section>

      <NewBooks />
      <Button size='lg'
        asChild
        className="flex mt-10 mb-10 mx-auto w-fit bg-green-500 hover:bg-green-600 px-8 py-6 rounded-xl normal-case tracking-normal"
      >
        <Link href='/books'>Explore All Books</Link>
      </Button>



      {/* How to Sell Section */}
      <section className="py-16 bg-amber-50" >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" >
            <h2 className="text-3xl font-bold mb-4" >
              How to SELL your books online on XarBooks
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto" >
              Earning money by selling your old books is just 3 steps away from you :)
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative" >
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-gray-300 -z-10" />

            {sellSteps.map((step, index) => (
              <div key={index} className="relative flex flex-col h-full" >
                <div className="bg-white rounded-xl p-8 shadow-lg text-center grow flex flex-col" >
                  <div className="absolute top-2 left-14 translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-medium z-10" >
                    {step.step}
                  </div>

                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" >
                    {step.icon}
                  </div>
                  <h3 className="font-semibold mb-2" >{step.title}</h3>
                  <p className="text-gray-600 text-sm grow" >{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to buy section */}
      <section className="py-16 bg-gray-50" >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" >
            <h2 className="text-3xl font-bold mb-4" >
              How to BUY used books online on XarBooks?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto" >
              Saving some good amount of money by buying used books is just 3 steps away from you :)
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative" >
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-gray-300 -z-10" />

            {buySteps.map((step, index) => (
              <div key={index} className="relative flex flex-col h-full" >
                <div className="bg-yellow-400 rounded-xl p-8 shadow-lg text-center grow flex flex-col" >
                  <div className="absolute top-2 left-14 translate-x-1/2 bg-white text-gray-900 px-4 py-1 rounded-full text-sm font-medium z-10" >
                    {step.step}
                  </div>

                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" >
                    {step.icon}
                  </div>
                  <h3 className="font-semibold mb-2" >{step.title}</h3>
                  <p className="text-gray-600 text-sm grow" >{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* blog post */}
      <section className="py-16 bg-[rgb(221,234,254)]" >
        <div className="container mx-auto px-4" >
          <h2 className="text-3xl font-bold text-center mb-12">
            Read from our <span className="text-primary">Blog</span>
          </h2>
        <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post,index)=>(
                <Card
                  key={index}
                  className="h-full flex flex-col overflow-hidden py-0 gap-0 transition-all duration-300"
                
                >
                  <CardContent className="p-0 flex flex-col h-full" >
                      <div className="relative h-48 overflow-hidden" >
                          <Image
                            src={post.imageSrc}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-110"
                          />
                      </div>
                      <div className="p-6 flex-col flex grow" >
                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2" >
                            <div className="bg-primary/10 p-2 rounded-full" >
                                {post.icon}
                            </div>
                            <span className="grow" >{post.title}</span>
                        </h3>
                        <p className="text-gray-600 text-sm grow" >{post.description}</p>
                        <Button asChild variant='link' className="mt-4 p-0 items-center justify-start text-primary" >
                          <Link href={post.href}>
                            Read More <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      
                      </div>
                  </CardContent>

                </Card>
            ))}
        </div>
        </div>

      </section>

    </main>
  );
}
