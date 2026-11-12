import type { Metadata } from "next";
import SellBookForm from "../components/SellBookForm";

export const metadata: Metadata = {
  title: "Sell Your Books | Xar Books",
};

export default function BookSellPage() {
  return (
   <div className="mx-auto max-w-3xl px-4 py-10" >
    <SellBookForm/>
   </div>
  );
}
