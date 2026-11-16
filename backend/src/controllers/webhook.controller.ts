import { Request, Response } from "express";
import Stripe from "stripe";
import { getStripe } from "../config/stripe";
import { Order } from "../models/Order";
import { releaseOrder } from "../utils/orderPayment";


export const stripeWebhook = async (req: Request, res: Response) => {
    const secret= process.env.STRIPE_WEBHOOK_SECRET;
    if(!secret){
        throw new Error ("STRIPE_WEBHOOK_SECRET is missing from .env");
    }

    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string"){
        res.status(400).json({success: false, message: "Missing Stripe signature"});
        return;
    }

    let event: Stripe.Event;
    try{
        event = getStripe().webhooks.constructEvent(req.body, signature, secret);

    } catch {
        res.status(400).json({success: false, message:"Invalid Stripe signature"});
        return;
    }

    if (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid"){
        await Order.updateOne(
            {stripeSessionId: event.data.object.id, paymentStatus: "pending"},
            {$set: {paymentStatus: "paid"}}
        );
    }

    if(event.type === "checkout.session.expired"){
        const order = await Order.findOne({stripeSessionId: event.data.object.id});
        if (order){
            await releaseOrder(order._id);
        }
    }

    res.json({received: true});

};