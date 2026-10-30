"use client"


import { cn } from "@/lib/utils";


export const BookLoader = () => {
  return (
    <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg")}>
      <div className="relative flex justify-center items-center">
    <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
    <img src="https://cdn.21st.dev/assets/mirror/fc/fcdb55708cabc7f90eab364e986966c1d584eae9d5af4da52d2ca6944ebd524d.svg"  className="rounded-full h-28 w-28" />
</div>
    </div>
  );
};

