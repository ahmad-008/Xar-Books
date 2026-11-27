import SellBookForm from "@/app/components/SellBookForm";
import { Metadata } from "next";



export const metadata: Metadata = {
    title: "Add Book | Xar Books Admin",
};

export default function AdminAddBookPage(){
    return(
        <div className="mx-auto max-w-3xl px-4 py-10" >
            <SellBookForm doneUrl="/admin/books" />
        </div>
    )
}