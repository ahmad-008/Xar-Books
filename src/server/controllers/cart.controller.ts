import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { AppError } from "../utils/AppError";
import { requireUserId } from "../utils/auth";
import { Params, readJson } from "../utils/http";

const sendCart = async (userId: string, message?: string) => {
    const cart = await Cart.findOne({ user: userId }).populate({
        path: "items",
        select: "title images price finalPrice shippingCharge condition isSold seller",
        populate: { path: "seller", select: "name" },
    });

    return NextResponse.json({ success: true, message, data: cart?.items ?? [] });
};

export const getCart = async (req: NextRequest) => sendCart(await requireUserId(req));

export const addToCart = async (req: NextRequest) => {
    const userId = await requireUserId(req);
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
        throw new AppError("You can't add your own book to the cart", 400);
    }

    await Cart.findOneAndUpdate({ user: userId }, { $addToSet: { items: product._id } }, { upsert: true });

    return sendCart(userId, "Added to cart");
};

export const removeFromCart = async (req: NextRequest, { productId }: Params) => {
    const userId = await requireUserId(req);

    if (!isValidObjectId(productId)) {
        throw new AppError("Book not found", 404);
    }

    await Cart.updateOne({ user: userId }, { $pull: { items: productId } });

    return sendCart(userId, "Removed from cart");
};

export const clearCart = async (req: NextRequest) => {
    const userId = await requireUserId(req);

    await Cart.updateOne({ user: userId }, { $set: { items: [] } });

    return sendCart(userId, "Cart cleared");
};
