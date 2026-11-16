"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookLoader } from "@/lib/BookLoader";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { ShippingAddress, useCreateOrderMutation, useGetCartQuery, PaymentMethod } from "@/store/api";
import { RootState } from "@/store/store";
import { toggleLoginDialog } from "@/store/slice/userSlice";
import NoData from "./NoData";

const FIELDS: { name: keyof ShippingAddress; label: string; optional?: boolean; maxLength: number }[] = [
    { name: "fullName", label: "Full name", maxLength: 100 },
    { name: "phone", label: "Phone", maxLength: 20 },
    { name: "addressLine1", label: "Address", maxLength: 200 },
    { name: "addressLine2", label: "Apartment, suite (optional)", optional: true, maxLength: 200 },
    { name: "city", label: "City", maxLength: 100 },
    { name: "state", label: "State / Province", maxLength: 100 },
    { name: "postalCode", label: "Postal code", maxLength: 20 },
    { name: "country", label: "Country", maxLength: 100 },
];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
    { value: "COD", label: "Cash on delivery", description: "pay when your books arrive." },
    { value: "Card", label: "Card", description: "pay now on Stripe's secure page." },
];

const EMPTY_ADDRESS: ShippingAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
};

export default function CheckoutContent() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const { data, isLoading } = useGetCartQuery(undefined, { skip: !user });
    const [createOrder, { isLoading: isPlacing }] = useCreateOrderMutation();
    const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");


    if (!user) {
        return (
            <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold">Checkout</h1>
                <p className="text-gray-600">Log in to place your order.</p>
                <Button onClick={() => dispatch(toggleLoginDialog())} className="normal-case tracking-normal">
                    Log in / Sign up
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <BookLoader />
            </div>
        );
    }

    const available = (data?.data ?? []).filter((item) => !item.isSold);

    if (available.length === 0) {
        return (
            <div className="space-y-4 text-center">
                <NoData message="Nothing to check out" description="Your cart has no available books." />
                <Button asChild className="rounded-md normal-case tracking-normal">
                    <Link href="/books">Browse books</Link>
                </Button>
            </div>
        );
    }

    const subtotal = available.reduce((sum, item) => sum + item.finalPrice, 0);
    const shipping = available.reduce((sum, item) => sum + item.shippingCharge, 0);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const result = await createOrder({ paymentMethod, shippingAddress: address }).unwrap();
            if(result.checkoutUrl){
                window.location.assign(result.checkoutUrl);
                return;
            }
            toast.success(result.message ?? "Order placed");
            router.push("/account/orders");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card className="gap-0 rounded-xl py-0 shadow-md">
                <CardContent className="space-y-4 p-6">
                    <h1 className="text-2xl font-bold">Shipping address</h1>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {FIELDS.map((field) => (
                            <div key={field.name} className="space-y-1">
                                <Label htmlFor={field.name}>{field.label}</Label>
                                <Input
                                    id={field.name}
                                    value={address[field.name] ?? ""}
                                    onChange={(event) => setAddress({ ...address, [field.name]: event.target.value })}
                                    required={!field.optional}
                                    maxLength={field.maxLength}
                                    autoComplete="on"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 border-t pt-4">
                        <h2 className="font-semibold">Payment</h2>
                        {PAYMENT_OPTIONS.map((option) => (
                            <label
                                key={option.value}
                                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${paymentMethod === option.value ? "border-orange-500 bg-orange-50" : "bg-white"}`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value={option.value}
                                    checked={paymentMethod === option.value}
                                    onChange={() => setPaymentMethod(option.value)}
                                    className="mt-1 accent-orange-500"
                                />
                                <span>
                                    <strong>{option.label}</strong>: {option.description}
                                </span>

                            </label>
                        ))

                        }
                    </div>
                </CardContent>
            </Card>

            <Card className="h-fit gap-0 rounded-xl py-0 shadow-md">
                <CardContent className="space-y-3 p-6">
                    <h2 className="text-lg font-semibold">Your order</h2>
                    <ul className="space-y-1 text-sm">
                        {available.map((item) => (
                            <li key={item._id} className="flex justify-between gap-2">
                                <span className="line-clamp-1 min-w-0">{item.title}</span>
                                <span>${item.finalPrice.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between border-t pt-3 text-sm">
                        <span>Shipping</span>
                        <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : "Free"}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${(subtotal + shipping).toFixed(2)}</span>
                    </div>
                    <Button type="submit" disabled={isPlacing} className="w-full rounded-md normal-case tracking-normal">
                        {isPlacing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        {paymentMethod === "Card" ? "Continue to payment" : "Place order"}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}
