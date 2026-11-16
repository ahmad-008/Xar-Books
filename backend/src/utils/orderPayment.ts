import mongoose, { HydratedDocument, Types } from "mongoose";
import Stripe from "stripe";
import { getStripe } from "../config/stripe";
import { IOrder, Order } from "../models/Order";
import { Product } from "../models/Product";
import { AppError } from "./AppError";

const toCents = (amount: number) => Math.round(amount * 100);

export const createCheckoutSession = async (order: HydratedDocument<IOrder>) => {
    if (order.totalAmount < 0.5) {
        throw new AppError("Card payments need a total of at least $0.50", 400);
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
        quantity: 1,
        price_data: {
            currency: "usd",
            unit_amount: toCents(item.price),
            product_data: { name: item.title, images: [item.image] },
        },
    }));

    if (order.shippingTotal > 0) {
        lineItems.push({
            quantity: 1,
            price_data: {
                currency: "usd",
                unit_amount: toCents(order.shippingTotal),
                product_data: { name: "Shipping" },
            },
        });
    }

    const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        client_reference_id: order.id,
        metadata: { orderId: order.id },
        success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/account/orders`,
        expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
    });

    order.stripeSessionId = session.id;
    await order.save();

    return session.url;
};

export const releaseOrder = async (orderId: Types.ObjectId | string) => {
    await mongoose.connection.transaction(async (session) => {
        const order = await Order.findOneAndUpdate(
            { _id: orderId, paymentStatus: "pending", orderStatus: "processing" },
            { $set: { paymentStatus: "failed", orderStatus: "cancelled" } },
            { session }
        );

        if (!order) return;

        await Product.updateMany(
            { _id: { $in: order.items.map((item) => item.product) } },
            { $set: { isSold: false } },
            { session }
        );
    });
};
