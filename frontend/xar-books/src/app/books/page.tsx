import { BookLoader } from "@/lib/BookLoader";
import { Suspense } from "react";
import BooksContent from "./BooksContent";


export default function BooksPage(){
    return(
        <Suspense fallback={<BookLoader/>} >

            <BooksContent/>

        </Suspense>
    )
}