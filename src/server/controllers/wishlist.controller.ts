import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Product } from "../models/Product";
import { Wishlist } from "../models/Wishlist";
import { AppError } from "../utils/AppError";
import { requireUserId } from "../utils/auth";
import { Params, readJson } from "../utils/http";

const sendWishlist = async (userId: string, message?: string) => {
    const wishlist = await Wishlist.findOne({ user: userId }).populate({
        path: "items",
        select: "title images price finalPrice shippingCharge condition isSold seller",
        populate: { path: "seller", select: "name" },
    });

    return NextResponse.json({ success: true, message, data: wishlist?.items ?? [] });
};

export const getWishlist = async (req: NextRequest) => sendWishlist(requireUserId(req));

export const addToWishlist = async (req: NextRequest) => {
    const userId = requireUserId(req);
    const { productId } = await readJson(req);

    if (typeof productId !== "string" || !isValidObjectId(productId)) {
        throw new AppError("Book not found", 404);
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError("Book not found", 404);
    }

    if (product.isSold) {
        throw new AppError("This book has already been sold", 400);
    }

    if (product.seller.toString() === userId) {
        throw new AppError("You can't add your own book to the wishlist", 400);
    }

    await Wishlist.findOneAndUpdate({ user: userId }, { $addToSet: { items: product._id } }, { upsert: true });

    return sendWishlist(userId, "Added to wishlist");
};

export const removeFromWishlist = async (req: NextRequest, { productId }: Params) => {
    const userId = requireUserId(req);

    if (!isValidObjectId(productId)) {
        throw new AppError("Book not found", 404);
    }

    await Wishlist.updateOne({ user: userId }, { $pull: { items: productId } });

    return sendWishlist(userId, "Removed from wishlist");
};
