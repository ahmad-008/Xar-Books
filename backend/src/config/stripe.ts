import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export const getStripe = () => {
    if (!stripeClient) {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if(!secretKey) {
            throw new Error ("STRIPE_SECRET_KEY is missing from .env");
        }
        stripeClient = new Stripe(secretKey);
    }
    return stripeClient;
};
