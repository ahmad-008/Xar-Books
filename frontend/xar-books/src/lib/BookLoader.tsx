"use client"


import { cn } from "@/lib/utils";
import Image from "next/image";


export const BookLoader = () => {
  return (
    <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg")}>
      <div className="relative flex justify-center items-center">
    <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
    <Image src="/images/loader.svg" alt="Loading" width={112} height={112} className="rounded-full h-28 w-28" />
</div>
    </div>
  );
};

