import { NextRequest } from "next/server";
import { RateLimit } from "../models/RateLimit";
import { AppError } from "./AppError";

export const clientIp = (req: NextRequest) => 
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

export const rateLimit = async(key: string, max: number, windowMinutes: number) => {
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMinutes * 60 * 1000);
    const isActive = {$gt: ["$expiresAt", now]};

    const entry = await RateLimit.findOneAndUpdate(
        {key},
        [
            {
                $set:{
                    count: {$cond: [isActive,{$add:["$count",1]}, 1]},
                    expiresAt: {$cond: [isActive, "$expiresAt", resetAt]},
                },
            },
        ],
        {upsert: true, returnDocument:"after", updatePipeline: true}
    );

    if (entry && entry.count > max){
        const seconds = Math.ceil((entry.expiresAt.getTime() - now.getTime()) / 1000);
        const minutes = Math.ceil(seconds / 60);
        throw new AppError(`Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}`, 429, seconds);
    }
};

export const clearRateLimit = (key: string) => RateLimit.deleteOne({key});