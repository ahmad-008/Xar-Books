import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "../config/stripe";
import { Order } from "../models/Order";
import { releaseOrder } from "../utils/orderPayment";

const reject = (message: string) => NextResponse.json({ success: false, message }, { status: 400 });

export const stripeWebhook = async (req: NextRequest) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is missing from .env.local");
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
        return reject("Missing Stripe signature");
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(body, signature, secret);
    } catch (error) {
        console.error("Stripe webhook rejected:", error instanceof Error ? error.message : error);
        return reject("Invalid Stripe signature");
    }

    if (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid") {
        await Order.updateOne(
            { stripeSessionId: event.data.object.id, paymentStatus: "pending" },
            { $set: { paymentStatus: "paid" } }
        );
    }

    if (event.type === "checkout.session.expired") {
        const order = await Order.findOne({ stripeSessionId: event.data.object.id });
        if (order) {
            await releaseOrder(order._id);
        }
    }

    return NextResponse.json({ received: true });
};
