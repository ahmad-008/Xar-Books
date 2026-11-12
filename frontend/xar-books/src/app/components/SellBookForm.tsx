"use client";

import { RootState } from "@/store/store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ImagePicker, { PickedImage } from "@/app/components/ImagePicker";
import { useCreateProductMutation } from "@/store/api";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toggleLoginDialog } from "@/store/slice/userSlice";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { filters } from "@/lib/Constant";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";



interface SellFormData {
    title: string;
    author: string;
    edition: string;
    subject: string;
    category: string;
    condition: string;
    classType: string;
    price: string;
    finalPrice: string;
    shippingCharge: string;
    description: string;
}

const emptyForm: SellFormData = {
    title: "", author: "", edition: "", subject: "", category: "", condition: "",
    classType: "", price: "", finalPrice: "", shippingCharge: "", description: "",
};

const ErrorText = ({ message }: { message?: string }) =>
    message ? <p className="mt-1 text-sm text-red-500" >{message}</p> : null;


export default function SellBookForm() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const [images, setImages] = useState<PickedImage[]>([]);
    const [imageError, setImageError] = useState("");
    const [createProduct, { isLoading }] = useCreateProductMutation();
    const router = useRouter();


    const {
        register, handleSubmit,
        control, reset, formState: { errors },
    } = useForm<SellFormData>({ defaultValues: emptyForm });


    if (!user) {
        return (
            <div className="space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm" >
                <h1 className="text-2xl font-bold" >Sell your books</h1>
                <p className="text-gray-600" >Log in to list a book for sale.</p>

                <Button onClick={() => dispatch(toggleLoginDialog())} className="normal-case tracking-normal" >

                    Log in / Sign up
                </Button>
            </div>
        );
    }

    if (!user.isEmailVerified) {
        return (
            <div className="space-y-2 rounded-lg border bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold">Verify your email first</h1>
                <p className="text-gray-600">
                    Please verify your email before selling a book. Use &quot;Resend email&quot; in the yellow bar at the top if you need a new link.
                </p>
            </div>
        );
    }

    const handleImagesChange = (next: PickedImage[]) => {
        setImages(next);
        if (next.length > 0) setImageError("");
    };

    const onSubmit = async (data: SellFormData) => {
        if (images.length === 0) {
            setImageError("Add at least one photo");
            return;
        }


        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value.trim() !== "") formData.append(key, value.trim());
        });
        images.forEach((image) => formData.append("images", image.file));

        try {
            const result = await createProduct(formData).unwrap();
            toast.success(result.message ?? "Book listed for sale");
            reset(emptyForm);
            setImages([]);
            router.push("/account/selling-products");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const onInvalid = () => {
        if (images.length === 0) setImageError("Add at least one photo");
    };

    return (

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8 rounded-lg border bg-white p-6 shadow-sm" >
            <div>
                <h1 className="text-2xl font-bold" >Sell your book</h1>
                <p className="text-sm text-gray-600">Fill in the details and add clear photos of your book.</p>
            </div>

            <section className="space-y-3" >
                <h2 className="text-lg font-semibold">Photos</h2>
                <ImagePicker images={images} onChange={handleImagesChange} />
                <p className="text-xs text-gray-500">Up to 4 photos. The first one is the cover.</p>
                <ErrorText message={imageError} />
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold" >Book details</h2>

                <div>
                    <Label htmlFor="title" >Title *</Label>
                    <Input id="title" placeholder="e.g. The Alchemist" {...register("title", { required: "Title is required" })} />
                    <ErrorText message={errors.title?.message} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="author">Author</Label>
                        <Input id="author" {...register("author")} />
                    </div>
                    <div>
                        <Label htmlFor="edition">Edition</Label>
                        <Input id="edition" placeholder="e.g. 2nd Edition" {...register("edition")} />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input id="subject" placeholder="e.g. Mathematics" {...register("subject", { required: "Subject is required" })} />
                        <ErrorText message={errors.subject?.message} />
                    </div>

                    <div>
                        <Label>Class / Course *</Label>
                        <Controller
                            name="classType"
                            control={control}
                            rules={{ required: "Choose a class or course" }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose one" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filters.classType.map((option) => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))

                                        }
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <ErrorText message={errors.classType?.message} />





                    </div>

                </div>

                <div>
                    <Label>Category *</Label>
                    <Controller
                        name="category"

                        control={control}
                        rules={{ required: "Choose a category" }}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange} >
                                <SelectTrigger className="w-full" >
                                    <SelectValue placeholder="Choose a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filters.category.map((option) => (
                                        <SelectItem key={option} value={option} >{option}</SelectItem>
                                    ))

                                    }
                                </SelectContent>

                            </Select>
                        )}

                    />
                    <ErrorText message={errors.category?.message} />
                </div>

                <div>
                    <Label>Condition *</Label>
                    <Controller
                        name="condition"
                        control={control}
                        rules={{required: "Choose the condition"}}
                        render={({field})=> (
                            <RadioGroup value={field.value} onValueChange={field.onChange} className="mt-2 flex flex-wrap gap-6" >
                                {filters.condition.map((option)=> (
                                    <div key={option} className="flex items-center gap-2">
                                        <RadioGroupItem value={option} id={`condition-${option}`} />
                                        <Label htmlFor={`condition-${option}`} className="font-normal" >{option}</Label>

                                    </div>
                                ))

                                }
                            </RadioGroup>
                        )}
                    />
                    <ErrorText message={errors.condition?.message}/>
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                        id="description"
                        rows={4}
                        placeholder="Any notes, highlights or missing pages?"
                        {...register("description",{maxLength:{value: 2000, message:"Keep it under 2000 characters"}})}
                    />
                    <ErrorText message={errors.description?.message}/>
                </div>

            </section>


            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Price</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <Label htmlFor="price">Original price ($) *</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            {...register("price", {
                                required: "Enter the original price",
                                validate: (value) => Number(value) > 0 || "Enter a price above 0",
                            })}
                        />
                        <ErrorText message={errors.price?.message} />
                    </div>
                    <div>
                        <Label htmlFor="finalPrice">Your price ($) *</Label>
                        <Input
                            id="finalPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            {...register("finalPrice", {
                                required: "Enter your selling price",
                                validate: (value, form) =>
                                    Number(value) <= Number(form.price) || "Can't be higher than the original price",
                            })}
                        />
                        <ErrorText message={errors.finalPrice?.message} />
                    </div>
                    <div>
                        <Label htmlFor="shippingCharge">Shipping ($)</Label>
                        <Input
                            id="shippingCharge"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0 = free"
                            {...register("shippingCharge", {
                                validate: (value) => value === "" || Number(value) >= 0 || "Can't be negative",
                            })}
                        />
                        <ErrorText message={errors.shippingCharge?.message} />
                    </div>
                </div>
            </section>

            <Button type="submit" disabled={isLoading} className="w-full rounded-md font-bold normal-case tracking-normal">
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "List my book"}
            </Button>

       



        </form >


    );
}
