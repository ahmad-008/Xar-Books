import type { Metadata } from "next";
import AdminOrderDetail from "@/app/components/AdminOrderDetail";

export const metadata: Metadata = {
    title: "Order | Xar Books Admin",
};

type Props = {params: Promise<{id: string}>};

export default async function AdminOrderPage({params}: Props){
    const {id} = await params;
    return(
        <div className="mx-auto max-w-5xl px-4 py-10" >
            <AdminOrderDetail id={id}/>
        </div>
    )
}