import { NextRequest, NextResponse } from "next/server";
import { Order, ORDER_STATUSES } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { requireAdmin } from "../utils/auth";
import { isValidObjectId } from "mongoose";
import { AppError } from "../utils/AppError";
import { Params, readJson } from "../utils/http";
import { deleteImages, escapeRegex } from "./product.controller";



export const getStats = async (req: NextRequest) => {
    await requireAdmin(req);

    const [users, booksForSale, booksSold, statusCounts, paid, recentOrders, recentUsers] = await Promise.all([
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
    ]);

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
            recentUsers
        },
    });
};

export const removeProduct = async (req: NextRequest, {id}: Params) => {
    await requireAdmin(req);

    if(!isValidObjectId(id)){
        throw new AppError("Book not found", 404);
    }

    const product = await Product.findOneAndDelete({_id: id, isSold: false});
    if(!product){
        throw new AppError("This book was sold or already removed", 404);
    }

    await deleteImages(product.images);

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
    await requireAdmin(req);
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
     return NextResponse.json({ success: true, message: blocked ? "User blocked" : "User unblocked" });
};
