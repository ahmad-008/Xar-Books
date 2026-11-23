import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Order } from "../models/Order";
import { Product } from "../models/Product";

const STALE_DAYS = 7;

export const cancelStaleCodOrders = async () => {
    await connectDB();
    const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);

    const stale = {
        paymentMethod: "COD",
        paymentStatus: "pending",
        orderStatus: "processing",
        "items.status": { $nin: ["shipped", "delivered"] },
        createdAt: { $lt: cutoff },
    } as const;

    const orders = await Order.find(stale).select("_id");

    for (const { _id } of orders) {
        await mongoose.connection.transaction(async (session) => {
            const order = await Order.findOneAndUpdate(
                { _id, ...stale },
                { $set: { orderStatus: "cancelled", paymentStatus: "failed", "items.$[].status": "cancelled" } },
                { session }
            );
            if (!order) return;

            const stillHeld = order.items.filter((item) => item.status !== "cancelled").map((item) => item.product);
            await Product.updateMany({ _id: { $in: stillHeld } }, { $set: { isSold: false } }, { session });
        });
    }

    return orders.length;
};