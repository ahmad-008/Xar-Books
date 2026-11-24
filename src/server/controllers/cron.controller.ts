import { NextRequest, NextResponse } from "next/server";
import { autoConfirmDelivery } from "../jobs/autoConfirmDelivery";
import { cancelStaleCodOrders } from "../jobs/cancelStaleCodOrders";
import { AppError } from "../utils/AppError";

export const runOrderJobs = async (req: NextRequest) => {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`){
        throw new AppError("Not allowed", 401);
    }

    const [cancel, confirm] = await Promise.allSettled([cancelStaleCodOrders(), autoConfirmDelivery()]);

    if (cancel.status === "rejected") console.error("Auto-cancel failed:", cancel.reason);
    if(confirm.status ==="rejected") console.error("Auto-confirm failed:", confirm.reason);
    if(cancel.status === "rejected" || confirm.status === "rejected") {
        throw new AppError("An order job failed", 500);
    }

    return NextResponse.json({success: true, data: {cancelled: cancel.value, confirmed: confirm.value}});
};