import { connectDB } from "../config/db";
import {Order} from "../models/Order";

const CONFIRM_AFTER_DAYS = 14;

export const autoConfirmDelivery = async () => {
    await connectDB();
    const cutoff = new Date(Date.now() - CONFIRM_AFTER_DAYS * 24 * 60 * 60 * 1000);

    const result = await Order.updateMany(
        {orderStatus: "shipped", shippedAt: {$lt:cutoff}},
        {$set:{orderStatus: "delivered", paymentStatus: "paid", "items.$[item].status": "delivered"}},
        {arrayFilters: [{"item.status": "shipped"}]}
    );
    return result.modifiedCount;
};