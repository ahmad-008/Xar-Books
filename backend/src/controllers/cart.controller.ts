import { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { isValidObjectId } from "mongoose";
import { AppError } from "../utils/AppError";
import { Product } from "../models/Product";

const sendCart = async (userId: string | undefined,
    res:Response, message?:string
) => {
    const cart = await Cart.findOne({user: userId}).populate({
        path: "items",
        select: "title images price finalPrice shippingCharge condition isSold seller",
        populate: {path: "seller", select: "name"},
    });

    res.json({success: true, message, data: cart?.items ?? []});
};

export const getCart = async (req: Request, res: Response) => {
    await sendCart(req.userId, res);
};

export const addToCart = async (req: Request, res: Response) => {
    const {productId} = req.body ?? {};

    if(typeof productId !== "string" || !isValidObjectId(productId)) {
        throw new AppError("Book not found", 404);
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError("Book not found", 404);
    }

    if (product.isSold) {
        throw new AppError("This book has already been sold", 400);
    }

    if(product.seller.toString() === req.userId){
        throw new AppError("You can't add your own book to the cart", 400);
    }

    await Cart.findOneAndUpdate(
        {user: req.userId},
        {$addToSet: {items: product._id}},
        {upsert: true}
    );

    await sendCart(req.userId, res, "Added to cart");
};

export const removeFromCart = async (req: Request, res: Response) =>{
    const {productId} = req.params;

    
    if (typeof productId !== "string" || !isValidObjectId(productId)) {
        throw new AppError("Book not found", 404);
    }

    await Cart.updateOne({user: req.userId}, {$pull: {items: productId}});

    await sendCart(req.userId, res, "Remove from cart");
};


export const clearCart = async (req: Request, res: Response) => {
    await Cart.updateOne({ user: req.userId }, { $set: { items: [] } });

    await sendCart(req.userId, res, "Cart cleared");
};

