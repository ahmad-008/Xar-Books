import mongoose, { HydratedDocument, isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Cart } from "../models/Cart";
import { IOrder, IOrderItem, IShippingAddress, Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { requireUserId } from "../utils/auth";
import { Params, appUrl, readJson } from "../utils/http";
import { cancelOrderByBuyer, createCheckoutSession, releaseOrder, syncCheckout } from "../utils/orderPayment";

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
const   MAX_OPEN_COD_ORDERS = 3;

const readAddress = (input: unknown): IShippingAddress => {
    const source = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
    const address: Partial<Record<AddressField, string>> = {};

    for (const field of ADDRESS_FIELDS) {
        const value = source[field];
        if (typeof value === "string" && value.trim()) {
            address[field] = value.trim();
        }
    }

    const isMissing = ADDRESS_FIELDS.some((field) => field !== "addressLine2" && !address[field]);
    if (isMissing) {
               throw new AppError("Please fill in your full shipping address", 400);
    }
    if (!/^[0-9+\-\s()]{7,20}$/.test(address.phone ?? "")) {
        throw new AppError("Enter a valid phone number", 400);
    }
    if (!/^[A-Za-z0-9\s-]{3,10}$/.test(address.postalCode ?? "")) {
        throw new AppError("Enter a valid postal code", 400);
    }


    return address as IShippingAddress;
};

export const createOrder = async (req: NextRequest) => {
    const userId = await requireUserId(req);
    const { paymentMethod, shippingAddress } = await readJson(req);

    if (paymentMethod !== "COD" && paymentMethod !== "Card") {
        throw new AppError("Please choose a payment method", 400);
    }

    const address = readAddress(shippingAddress);
    const buyer = await User.findById(userId);
    if(!buyer){
        throw new AppError("Please log in to continue", 401);
    }
    if (!buyer.isEmailVerified){
        throw new AppError("Please verify your email before placing an order",403);
    }

    if(paymentMethod === "COD"){
        const openOrders = await Order.countDocuments({
            buyer: userId,
            paymentMethod: "COD",
            orderStatus: {$in: ["processing", "shipped"]},
        });
        if(openOrders >= MAX_OPEN_COD_ORDERS) {
            throw new AppError(
                `You can have up to ${MAX_OPEN_COD_ORDERS} open cash on delivery orders. Please wait for one to arrive or cancel one first`,
                400
            );
        }
    }

    const order = await mongoose.connection.transaction(async (session) => {
        const cart = await Cart.findOne({ user: userId }).session(session);

        const products = await Product.find({
            _id: { $in: cart?.items ?? [] },
            isSold: false,
            seller: { $ne: userId },
        }).session(session);

        if (products.length === 0) {
            throw new AppError("There are no available books in your cart", 400);
        }

        const productIds = products.map((product) => product._id);

        const marked = await Product.updateMany(
            { _id: { $in: productIds }, isSold: false },
            { $set: { isSold: true } },
            { session }
        );

        if (marked.modifiedCount !== products.length) {
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
                    buyer: userId,
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

        await Cart.updateOne({ user: userId }, { $pull: { items: { $in: productIds } } }, { session });

        return newOrder;
    });

    if (paymentMethod === "COD") {
        return NextResponse.json({ success: true, message: "Order placed", data: order }, { status: 201 });
    }

    try {
        const checkoutUrl = await createCheckoutSession(order, appUrl(req));
        return NextResponse.json(
            { success: true, message: "Redirecting to payment", data: order, checkoutUrl },
            { status: 201 }
        );
    } catch (error) {
        await releaseOrder(order._id);
        throw error;
    }
};

export const getMyOrders = async (req: NextRequest) => {
    const orders = await Order.find({ buyer: await requireUserId(req) }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders });
};

export const getOrderById = async (req: NextRequest, { id }: Params) => {
    const userId = await requireUserId(req);

    if (!isValidObjectId(id)) {
        throw new AppError("Order not found", 404);
    }

    const order = await Order.findOne({ _id: id, buyer: userId });
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    return NextResponse.json({ success: true, data: order });
};

export const cancelOrder = async (req: NextRequest, { id }: Params) => {
    const userId = await requireUserId(req);

    if (!isValidObjectId(id)) {
        throw new AppError("Order not found", 404);
    }

    const order = await cancelOrderByBuyer(id, userId);
    const message = order.paymentStatus === "refunded"
        ? "Order cancelled. Your refund is on its way"
        : "Order cancelled";

    return NextResponse.json({ success: true, message, data: order });
};

export const payOrder= async (req: NextRequest, {id}: Params)=> {
    const userId= await requireUserId(req);

    if(!isValidObjectId(id)){
        throw new AppError("Order not found", 404);
    }

    const order = await Order.findOne({_id: id, buyer: userId});
    if(!order){
        throw new AppError("Order not found", 404);
    }

    if(order.paymentMethod !== "Card"){
        throw new AppError("This is a cash on delivery order", 400);
    }
    if(order.orderStatus === "cancelled"){
        throw new AppError("This order was cancelled", 400);
    }

      const { order: latest, session } = await syncCheckout(order);

    if (latest.paymentStatus === "paid") {
        throw new AppError("This order is already paid", 400);
    }
    if (latest.orderStatus === "cancelled" || session?.status !== "open" || !session.url) {
        throw new AppError("This payment link has expired and the books are back on sale. Please order again", 400);
    }

    return NextResponse.json({success: true, checkoutUrl: session.url});
};

export const confirmCheckout = async (req: NextRequest) => {
    const userId = await requireUserId(req);
    const sessionId = req.nextUrl.searchParams.get("session_id");

    const order = sessionId ? await Order.findOne({stripeSessionId: sessionId, buyer: userId}) : null;
    if(!order){
        throw new AppError("Order not found", 404);
    }

    const {order: latest} = await syncCheckout(order);

    return NextResponse.json({success: true, data: latest});
};

const overallStatus = (items: IOrderItem[]) => {
    const active = items.filter((item) => item.status !== "cancelled");
    if (active.length === 0) return "cancelled";
    if (active.every((item) => item.status === "delivered")) return "delivered";
    if (active.every((item) => item.status !== "processing")) return "shipped";
    return "processing";
};

export const confirmReceived = async (req: NextRequest, { id }: Params) => {
    const userId = await requireUserId(req);

    if (!isValidObjectId(id)) {
        throw new AppError("Order not found", 404);
    }

    const order = await Order.findOne({ _id: id, buyer: userId });
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (order.orderStatus !== "shipped") {
        throw new AppError("You can confirm once all your books have shipped", 400);
    }

    order.items.forEach((item) => {
        if (item.status === "shipped") item.status = "delivered";
    });
    order.orderStatus = overallStatus(order.items);
    if (order.paymentMethod === "COD") {
        order.paymentStatus = "paid";
    }
    await order.save();

    return NextResponse.json({ success: true, message: "Thanks! Your order is marked as received", data: order });
};


const toSellerView = (order: HydratedDocument<IOrder>, sellerId: string) => ({
    _id: order._id,
    createdAt: order.createdAt,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    items: order.items.filter((item) => item.seller.toString() === sellerId),
});

export const getSellingOrders = async (req: NextRequest) => {
    const userId = await requireUserId(req);

    const orders = await Order.find({
        "items.seller": userId,
        $or: [{ paymentMethod: "COD" }, { paymentStatus: "paid" }],
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders.map((order) => toSellerView(order, userId)) });
};

export const updateSellingStatus = async (req: NextRequest, { id }: Params) => {
    const userId = await requireUserId(req);
    const { status } = await readJson(req);

    if (status !== "shipped") {
        throw new AppError("Only the buyer can confirm delivery", 400);
    }

    if (!isValidObjectId(id)) {
        throw new AppError("Order not found", 404);
    }

    const order = await Order.findOne({ _id: id, "items.seller": userId });
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (order.orderStatus === "cancelled") {
        throw new AppError("This order was cancelled", 400);
    }

    if (order.paymentMethod === "Card" && order.paymentStatus !== "paid") {
        throw new AppError("This order hasn't been paid yet", 400);
    }

    const myItems = order.items.filter((item) => item.seller.toString() === userId && item.status !== "cancelled");
    if(myItems.length === 0){
        throw new AppError("You rejected this order", 400);
    }
    if (myItems.some((item) => item.status !== "processing")) {
        throw new AppError("These books are already shipped", 400);
    }

    myItems.forEach((item) => {
        item.status = status;
    });
    order.orderStatus = overallStatus(order.items);
    if (order.orderStatus === "shipped" && !order.shippedAt){
        order.shippedAt = new Date();
    }
    await order.save();

    return NextResponse.json({
        success: true,
        message: `Marked as ${status}`,
        data: toSellerView(order, userId),
    });
};

export const rejectSellingOrder = async (req: NextRequest, {id}: Params) => {
    const userId = await requireUserId(req);

    if(!isValidObjectId(id)){
        throw new AppError("Order not found", 404);
    }

    const order = await mongoose.connection.transaction(async (session)=> {
        const order = await Order.findOne({_id: id, "items.seller": userId}).session(session);

        if(!order){
            throw new AppError("Order not found", 404);
        }

        if(order.orderStatus === "cancelled"){
            throw new AppError("This order was cancelled", 400);
        }

        if(order.paymentMethod !== "COD"){
            throw new AppError("Card orders can't be rejected. Please contact support", 400);
        }

        const myItems = order.items.filter((item)=> item.seller.toString() === userId && item.status !== "cancelled");
        if (myItems.length === 0){
            throw new AppError("You already rejected this order",400);
        }
        if(myItems.some((item)=> item.status !== "processing")){
            throw new AppError("Books that have shipped can't be rejected", 400);
        }

        myItems.forEach((item) =>{
            item.status = "cancelled";
        });

        const active = order.items.filter((item)=> item.status !== "cancelled");
        if(active.length > 0 ){
            order.itemsTotal = roundMoney(active.reduce((sum, item)=> sum + item.price, 0));
            order.shippingTotal = roundMoney(active.reduce((sum, item)=> sum + item.shippingCharge, 0));
            order.totalAmount =roundMoney(order.itemsTotal + order.shippingTotal);
        }
        order.orderStatus = overallStatus(order.items);
        await order.save({session});

        await Product.updateMany(
            {_id: {$in: myItems.map((item)=> item.product)}},
            {$set: {isSold: false}},
            {session}
        );

        return order;



    });

    return NextResponse.json({
        success: true,
        message: "Order rejected. Your books are back on sale",
        data: toSellerView(order,userId),
    });
};
