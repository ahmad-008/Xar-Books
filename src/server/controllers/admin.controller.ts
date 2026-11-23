import { NextRequest, NextResponse } from "next/server";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { requireAdmin } from "../utils/auth";

export const getStats = async (req: NextRequest) => {
    await requireAdmin(req);

    const [users, booksForSale, booksSold, statusCounts, paid] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments({ isSold: false }),
        Product.countDocuments({ isSold: true }),
        Order.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
        Order.aggregate<{ total: number }>([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
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
        },
    });
};