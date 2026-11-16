import mongoose from "mongoose";

const cache = globalThis as unknown as { mongoosePromise?: Promise<typeof mongoose> };

export const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is missing from .env.local");
    }

    cache.mongoosePromise ??= mongoose.connect(uri);

    try {
        await cache.mongoosePromise;
    } catch (error) {
        cache.mongoosePromise = undefined;
        throw error;
    }
};
