import type {QueryFilter} from "mongoose";
import {connectDB} from "../config/db";
import {IOrder, Order} from "../models/Order";

const CONFIRM_AFTER_DAYS = 14;

export const markDelivered = async (filter: QueryFilter<IOrder>) => {
    const result = await Order.updateMany(
        {...filter, orderStatus: "shipped"},
        {$set: {orderStatus: "delivered", paymentStatus: "paid", "items.$[item].status" : "delivered"}},
        { arrayFilters: [{ "item.status": "shipped" }] }
    );
    return result.modifiedCount;
};

export const autoConfirmDelivery = async () => {
    await connectDB();
    const cutoff = new Date(Date.now() - CONFIRM_AFTER_DAYS * 24 * 60 * 60 * 1000);
    return markDelivered({shippedAt: {$lt : cutoff}});
};