import mongoose, { HydratedDocument, Types } from "mongoose";
import Stripe from "stripe";
import { getStripe } from "../config/stripe";
import { IOrder, Order } from "../models/Order";
import { Product } from "../models/Product";
import { AppError } from "./AppError";

const toCents = (amount: number) => Math.round(amount * 100);

export const createCheckoutSession = async (order: HydratedDocument<IOrder>, frontendUrl: string) => {
    if (order.totalAmount < 0.5) {
        throw new AppError("Card payments need a total of at least $0.50", 400);
    }

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

const paymentIntentOf = (session: Stripe.Checkout.Session) =>
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

const refundOrder = async (order: HydratedDocument<IOrder>) => {
    let paymentIntentId = order.paymentIntentId;
    if (!paymentIntentId && order.stripeSessionId) {
        paymentIntentId = paymentIntentOf(await getStripe().checkout.sessions.retrieve(order.stripeSessionId));
    }
    if (!paymentIntentId) {
        throw new AppError("We couldn't find this payment. Please contact support", 500);
    }
    await getStripe().refunds.create({ payment_intent: paymentIntentId }, { idempotencyKey: `refund-${order.id}` });
};

export const cancelOrderByBuyer = async (orderId: string, buyerId: string) => {
    const order = await Order.findOne({ _id: orderId, buyer: buyerId });
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (order.orderStatus === "cancelled") {
        throw new AppError("This order is already cancelled", 400);
    }

    if (order.orderStatus !== "processing" || order.items.some((item) => item.status !== "processing")) {
        throw new AppError("This order can't be cancelled because a book has already shipped", 400);
    }

    let paymentStatus = order.paymentStatus;

    if (order.paymentMethod === "Card") {
        if (paymentStatus === "pending" && order.stripeSessionId) {
            const session = await getStripe().checkout.sessions.retrieve(order.stripeSessionId);
            if (session.status === "open") {
                await getStripe().checkout.sessions.expire(order.stripeSessionId);
            } else if (session.payment_status === "paid") {
                paymentStatus = "paid";
                order.paymentIntentId = paymentIntentOf(session);
            }
        }

        if (paymentStatus === "paid") {
            await refundOrder(order);
            paymentStatus = "refunded";
        } else {
            paymentStatus = "failed";
        }
    }

    const cancelled = await mongoose.connection.transaction(async (session) => {
        const updated = await Order.findOneAndUpdate(
            {
                _id: order._id,
                orderStatus: "processing",
                items: { $not: { $elemMatch: { status: { $ne: "processing" } } } },
            },
            { $set: { orderStatus: "cancelled", paymentStatus, paymentIntentId: order.paymentIntentId } },
            { session, returnDocument: "after" }
        );

        if (!updated) return null;

        await Product.updateMany(
            { _id: { $in: updated.items.map((item) => item.product) } },
            { $set: { isSold: false } },
            { session }
        );

        return updated;
    });

    if (cancelled) return cancelled;

    const latest = await Order.findById(order._id);
    if (latest?.orderStatus === "cancelled") return latest;

    if (paymentStatus === "refunded") {
        console.error(`Order ${order.id} was refunded but changed before it could be cancelled`);
    }
    throw new AppError("This order changed while cancelling. Please refresh and try again", 409);
};
