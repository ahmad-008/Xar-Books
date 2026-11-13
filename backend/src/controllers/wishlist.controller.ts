import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Wishlist } from "../models/Wishlist";
import { Product } from "../models/Product";
import { AppError } from "../utils/AppError";

const sendWishlist = async (userId: string | undefined, res: Response, message?: string) => {
    const wishlist = await Wishlist.findOne({ user: userId }).populate({
        path: "items",
        select: "title images price finalPrice shippingCharge condition isSold seller",
        populate: { path: "seller", select: "name" },
    });

    res.json({ success: true, message, data: wishlist?.items ?? [] });
};

export const getWishlist = async (req: Request, res: Response) => {
    await sendWishlist(req.userId, res);
};

export const addToWishlist = async (req: Request, res: Response) => {
    const { productId } = req.body ?? {};

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

    if (product.seller.toString() === req.userId) {
        throw new AppError("You can't add your own book to the wishlist", 400);
    }

    await Wishlist.findOneAndUpdate(
        { user: req.userId },
        { $addToSet: { items: product._id } },
        { upsert: true }
    );

    await sendWishlist(req.userId, res, "Added to wishlist");
};

export const removeFromWishlist = async (req: Request, res: Response) => {
    const { productId } = req.params;

    if (typeof productId !== "string" || !isValidObjectId(productId)) {
        throw new AppError("Book not found", 404);
    }

    await Wishlist.updateOne({ user: req.userId }, { $pull: { items: productId } });

    await sendWishlist(req.userId, res, "Removed from wishlist");
};
