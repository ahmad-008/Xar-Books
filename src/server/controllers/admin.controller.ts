import { NextRequest, NextResponse } from "next/server";
import { Order, ORDER_STATUSES } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { requireAdmin } from "../utils/auth";
import { isValidObjectId } from "mongoose";
import { AppError } from "../utils/AppError";
import { Params, readJson } from "../utils/http";
import { deleteImages, escapeRegex } from "./product.controller";
import { cancelCodOrder } from "../jobs/cancelStaleCodOrders";
import { markDelivered } from "../jobs/autoConfirmDelivery";
import { ActivityLog } from "../models/ActivityLog";
import { logActivity } from "../utils/activity";
import { cancelOrderWithRefund } from "../utils/orderPayment";


const SALES_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export const getStats = async (req: NextRequest) => {
    await requireAdmin(req);

    const today = new Date().toISOString().slice(0,10);
    const since = new Date(new Date(today).getTime() - (SALES_DAYS - 1) * DAY_MS);

    const [users, booksForSale, booksSold, statusCounts, paid, recentOrders, recentUsers, sales] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments({ isSold: false }),
        Product.countDocuments({ isSold: true }),
        Order.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
        Order.aggregate<{ total: number }>([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.find()
        .sort({createdAt: -1})
        .limit(10).select("buyer totalAmount orderStatus paymentMethod createdAt")
        .populate("buyer", "name email").lean(),
        User.find().sort({createdAt: -1})
        .limit(10)
        .select("name email role createdAt").lean(),
        Order.aggregate<{_id: string; orders: number; revenue: number}>([
            { $match: {createdAt:{$gte: since}}},
            {
                $group: {
                    _id: { $dateToString:{format: "%Y-%m-%d", date: "$createdAt"}},
                    orders: {$sum: 1},
                    revenue: {$sum:{$cond: [{$eq: ["$paymentStatus", "paid"]}, "$totalAmount", 0]}},
                },
            },

            
        ]),
    ]);

    const salesByDay = Array.from({length: SALES_DAYS}, (_, index) => {
        const date = new Date(since.getTime() +  index * DAY_MS ).toISOString().slice(0, 10);
        const day = sales.find((item) =>item._id === date);
        return {date, orders: day?.orders ?? 0, revenue: day?.revenue ?? 0};
    });

    const ordersByStatus = { processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    for (const { _id, count } of statusCounts) {
        if (_id in ordersByStatus) ordersByStatus[_id as keyof typeof ordersByStatus] = count;
    }

    return NextResponse.json({
        success: true,
        data: {
            users,
            booksForSale,
            booksSold,
            orders: Object.values(ordersByStatus).reduce((sum, n) => sum + n, 0),
            ordersByStatus,
            revenue: paid[0]?.total ?? 0,
            recentOrders,
            recentUsers,
            salesByDay,
        },
    });
};

export const removeProduct = async (req: NextRequest, {id}: Params) => {
     const adminId = await requireAdmin(req);

    if(!isValidObjectId(id)){
        throw new AppError("Book not found", 404);
    }

    const product = await Product.findOneAndDelete({_id: id, isSold: false});
    if(!product){
        throw new AppError("This book was sold or already removed", 404);
    }

    await deleteImages(product.images);
    await logActivity(adminId, "remove_book", id, product.title);

    return NextResponse.json({
        success: true, 
        message: "Listing removed"
    });
}

export const getOrders = async (req: NextRequest) => {
    await requireAdmin(req);
    const query= req.nextUrl.searchParams;
    const filter: Record<string, unknown> = {};

    const status = query.get("status");
    if (status && (ORDER_STATUSES as readonly string[]).includes(status)){
        filter.orderStatus = status;
    }

    const email = (query.get("email") ?? "").trim().toLowerCase();
    if(email){
        const buyer = await User.findOne({email}).select("_id");
        filter.buyer = buyer?._id ?? null;
    }

    const page = Math.max(1, Math.floor(Number(query.get("page"))) || 1);
    const limit = 10;

    const [orders, total] = await Promise.all([
        Order.find(filter)
        .sort({createdAt: -1})
        .skip((page - 1) * limit)
        .limit(limit)
        .select("buyer items totalAmount paymentMethod paymentStatus orderStatus createdAt shippingAddress.fullName shippingAddress.city shippingAddress.country")
        .populate("buyer","name email")
        .populate("items.seller", "name")
        .lean(),
     
        Order.countDocuments(filter),
    ]);

    return NextResponse.json({
        success: true,
        data: orders,
        pagination: {page, limit, total, pages:Math.ceil(total / limit)},
    });

};

export const getUsers = async (req: NextRequest) => {
    await requireAdmin(req);
    const query = req.nextUrl.searchParams;
    const filter: Record<string, unknown> = {};

    const search = (query.get("search") ?? "").trim().slice(0,100);
    if (search){
        const regex = new RegExp(escapeRegex(search), "i");
        filter.$or = [{name: regex}, {email: regex}];
    }

    const page = Math.max(1, Math.floor(Number(query.get("page"))) || 1);
    const limit = 10;

    const [users, total] = await Promise.all([
        User.find(filter)
            .sort({createdAt: -1})
            .skip((page - 1) * limit)
            .limit(limit)
            .select("name email role isEmailVerified isBlocked createdAt")
            .lean(),
          User.countDocuments(filter),  
    ]);

    return NextResponse.json({
        success: true,
        data: users,
        pagination: {page, limit, total, pages: Math.ceil(total /limit)},
    });
};

export const setUserBlocked = async (req: NextRequest, {id}: Params) =>{
     const adminId = await requireAdmin(req);
    const {blocked} = await readJson(req);

    if(typeof blocked !== "boolean"){
        throw new AppError("Choose block or unblock", 400);
    }

    if(!isValidObjectId(id)){
        throw new AppError("User not found", 404);
    }

    const user= await User.findOneAndUpdate({_id: id, role: "user"},{$set: {isBlocked: blocked}});
    if (!user){
        throw new AppError("User not found, or is an admin", 404);
    }
    await logActivity(adminId, blocked ? "block_user": "unblock_user", id, user.email);
     return NextResponse.json({ success: true, message: blocked ? "User blocked" : "User unblocked" });
};


export const getOrderDetails = async (req: NextRequest, {id}: Params)=>{
    await requireAdmin(req);

    if(!isValidObjectId(id)){
        throw new AppError("Order not found", 404);
    }

    const order = await Order.findById(id)
        .select("-stripeSessionId -paymentIntentId")
        .populate("buyer", "name email")
        .populate("items.seller", "name")
        .lean();

    if (!order) {
        throw new AppError("Order not found", 404);
    }    

    return NextResponse.json({success: true, data: order});
};

export const adminCancelOrder = async (req: NextRequest, { id }: Params) => {
   const adminId = await requireAdmin(req);

    if (!isValidObjectId(id)) {
        throw new AppError("Order not found", 404);
    }


    const order = await Order.findById(id).select("paymentMethod");
    if (!order){
        throw new AppError("Order not found", 404);
    }

    let message = "Order cancelled";
    if(order.paymentMethod === "Card"){
        const cancelled = await cancelOrderWithRefund(id);
        if (cancelled.paymentStatus === "refunded") message = "Order cancelled and refunded";
    } else if(!(await cancelCodOrder(id))){
        throw new AppError("Only cash-on-delivery orders that are unpaid and haven't shipped can be cancelled", 400);
    }
    await logActivity(adminId, "cancel_order", id, `Order #${id.slice(-6)}`);

      return NextResponse.json({ success: true, message });
};

export const adminDeliverOrder = async (req: NextRequest, {id}: Params) => {
    const adminId = await requireAdmin(req);

    if(!isValidObjectId(id)){
        throw new AppError("Order not found", 404);
    }

    if((await markDelivered({_id: id})) === 0){
        throw new AppError("Only shipped orders can be marked as delivered", 400);
    }
    await logActivity(adminId, "deliver_order", id, `Order #${id.slice(-6)}`);

    return NextResponse.json({ success: true, message: "Order marked as delivered" });
};

export const getActivity = async (req: NextRequest)=> {
    await requireAdmin(req);

    const page = Math.max(1, Math.floor(Number(req.nextUrl.searchParams.get("page"))) || 1 );
    const limit = 20;

    const [activity, total] = await Promise.all([
        ActivityLog.find()
        .sort({createdAt: -1})
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("admin", "name")
        .lean(),

        ActivityLog.countDocuments(),
    ]);

    return NextResponse.json({
        success: true,
        data: activity,
        pagination: {page, limit, total, pages: Math.ceil(total / limit)},
    });
};