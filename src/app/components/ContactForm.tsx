"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSendContactMessageMutation } from "@/store/api";
import { RootState } from "@/store/store";
import { getErrorMessage } from "@/lib/getErrorMessage";

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default function ContactForm() {
    const user = useSelector((state: RootState) => state.user.user);
    const [sendMessage, { isLoading }] = useSendContactMessageMutation();
    const [sentMessage, setSentMessage] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormData>({
        values: { name: user?.name ?? "", email: user?.email ?? "", subject: "", message: "" },
    });

    const onSubmit = async (data: ContactFormData) => {
        try {
            const res = await sendMessage({ ...data, subject: data.subject || undefined }).unwrap();
            setSentMessage(res.message);
            reset();
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    if (sentMessage) {
        return (
            <div className="space-y-4 py-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="text-2xl font-bold">Message sent</h2>
                <p className="text-gray-600">{sentMessage}</p>
                <Button variant="outline" onClick={() => setSentMessage("")} className="rounded-md normal-case tracking-normal">
                    Send another message
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="contact-name">Name *</Label>
                    <Input
                        id="contact-name"
                        placeholder="Your name"
                        {...register("name", {
                            required: "Name is required",
                            validate: (value) => (value.trim().length >= 2 && value.trim().length <= 50) || "Name must be 2 to 50 characters",
                        })}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contact-email">Email *</Label>
                    <Input
                        id="contact-email"
                        type="email"
                        placeholder="you@example.com"
                        {...register("email", {
                            required: "Email is required",
                            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                        })}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                    id="contact-subject"
                    placeholder="What is this about?"
                    {...register("subject", { maxLength: { value: 100, message: "Subject must be 100 characters or less" } })}
                />
                {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact-message">Message *</Label>
                <Textarea
                    id="contact-message"
                    rows={6}
                    placeholder="Tell us how we can help. If it's about an order, include the order number (for example #A1B2C3)."
                    {...register("message", {
                        required: "Message is required",
                        validate: (value) => (value.trim().length >= 10 && value.trim().length <= 2000) || "Message must be 10 to 2000 characters",
                    })}
                />
                {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full rounded-md font-bold normal-case tracking-normal sm:w-auto sm:px-8">
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Send message"}
            </Button>
        </form>
    );
}
