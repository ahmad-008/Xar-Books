import { Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { IShippingAddress, Order } from "../models/Order";
import { AppError } from "../utils/AppError";
import { createCheckoutSession, releaseOrder } from "../utils/orderPayment";

const ADDRESS_FIELDS = [
    "fullName",
    "phone",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "postalCode",
    "country",
] as const;

type AddressField = (typeof ADDRESS_FIELDS)[number];

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const readAddress = (input: unknown) : IShippingAddress => {
    const source = (typeof input === "object" && input !== null ? input:{}) as Record<string, unknown>;
    const address: Partial<Record<AddressField, string>> = {};

    for (const field of ADDRESS_FIELDS) {
        const value = source[field];
        if(typeof value === "string" && value.trim()){
            address[field] = value.trim();
        }
    }

    const isMissing = ADDRESS_FIELDS.some((field)=> 
    field !== "addressLine2" && !address[field]);

    if(isMissing){
        throw new AppError("Please fill in your full shipping address", 400);
    }
    return address as IShippingAddress;
};

export const createOrder = async (req: Request, res: Response) => {
    const {paymentMethod, shippingAddress} = req.body ?? {};

    if (paymentMethod !== "COD" && paymentMethod !== "Card") {
        throw new AppError("Please choose a payment method", 400);
    }

    const address = readAddress(shippingAddress);

    const order = await mongoose.connection.transaction(async(session)=> {
        const cart = await Cart.findOne({user: req.userId}).session(session);

        const products = await Product.find({
            _id: {$in: cart?.items ?? []},
            isSold: false,
            seller: {$ne: req.userId},

        }).session(session);

        if (products.length === 0){
            throw new AppError("There are no available books in your cart", 400);
        }

        const productIds = products.map((product)=> product._id);

        const marked = await Product.updateMany(
            {_id: {$in: productIds}, isSold: false},
            {$set: {isSold: true}},
            {session}
        ); 

        if(marked.modifiedCount !== products.length) {
            throw new AppError("One of these books was just sold. Please check your cart.", 409);
        }

        const items = products.map((product) => ({
            product: product._id,
            seller: product.seller,
            title: product.title,
            image: product.images[0],
            price: product.finalPrice,
            shippingCharge: product.shippingCharge,
        }));

        const itemsTotal = roundMoney(items.reduce((sum, item) => sum + item.price, 0));
        const shippingTotal = roundMoney(items.reduce((sum, item) => sum + item.shippingCharge, 0));

        const [newOrder] = await Order.create(
            [
                {
                    buyer: req.userId,
                    items,
                    shippingAddress: address,
                    itemsTotal,
                    shippingTotal,
                    totalAmount: roundMoney(itemsTotal + shippingTotal),
                    paymentMethod,
                },
            ],
            { session }
        );

        await Cart.updateOne(
            { user: req.userId },
            { $pull: { items: { $in: productIds } } },
            { session }
        );

        return newOrder;
    });

    if(paymentMethod === "COD"){
        res.status(201).json({success: true,message: "Order placed", data: order});
        return;
    }

    try{
        const checkoutUrl = await createCheckoutSession(order);
        res.status(201).json({success: true, message:"Redirecting to payment", data: order, checkoutUrl});
    } catch (error) {
        await releaseOrder(order._id);
        throw error;
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    const orders = await Order.find({ buyer: req.userId }).sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
};

export const getOrderById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (typeof id !== "string" || !isValidObjectId(id)) {
        throw new AppError("Order not found", 404);
    }

    const order = await Order.findOne({ _id: id, buyer: req.userId });
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    res.json({ success: true, data: order });
};
