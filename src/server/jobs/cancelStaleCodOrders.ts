import mongoose, {Types} from "mongoose";
import {connectDB} from "../config/db";
import {Order} from "../models/Order";
import {Product} from "../models/Product";

const STALE_DAYS = 7;

export const OPEN_COD_ORDER = {
    paymentMethod: "COD",
    paymentStatus: "pending",
    orderStatus: "processing",
    "items.status" : {$nin: ["shipped", "delivered"]},
} as const;

export const cancelCodOrder = (id: Types.ObjectId | string) => 
    mongoose.connection.transaction(async (session)=> {
        const order = await Order.findOneAndUpdate(
        {_id: id, ...OPEN_COD_ORDER},
        {$set: {orderStatus: "cancelled", paymentStatus: "failed", "items.$[].status": "cancelled"}},
        {session}
        );
        if (!order) return false;

        const stillHeld = order.items.filter((item)=> item.status !== "cancelled").map((item)=> item.product);
        await Product.updateMany({_id: {$in: stillHeld}}, {$set: {isSold: false}}, {session});
        return true;
    });

export const cancelStaleCodOrders = async () => {
    await connectDB();

    const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);

    const orders = await Order.find({...OPEN_COD_ORDER, createdAt: {$lt: cutoff}}).select("_id");

    let cancelled = 0;
    for (const {_id} of orders){
        if (await cancelCodOrder(_id)) cancelled++;
    }
    return cancelled;

};    