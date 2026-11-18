import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../config/db";
import "../models";
import { AppError } from "./AppError";

export type Params = Record<string, string>;
type Controller = (req: NextRequest, params: Params) => Promise<Response>;

const fail = (status: number, message: string) =>
    NextResponse.json({ success: false, message }, { status });

const toErrorResponse = (error: unknown) => {
    if (error instanceof AppError) {
        const res = fail(error.statusCode, error.message);
        if(error.retryAfter) res.headers.set("Retry-After", String(error.retryAfter));
        return res;
    }

    if (error instanceof mongoose.Error.ValidationError) {
        const firstError = Object.values(error.errors)[0];
        return fail(400, firstError?.message ?? "Invalid data");
    }

    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        return fail(409, "An account with this email already exists");
    }

    console.error(error);
    return fail(500, "Something went wrong");
};

export const handle =
    (controller: Controller) =>
    async (req: NextRequest, context: { params: Promise<Params> }) => {
        try {
            await connectDB();
            return await controller(req, (await context?.params) ?? {});
        } catch (error) {
            return toErrorResponse(error);
        }
    };

export const readJson = async (req: NextRequest): Promise<Record<string, unknown>> => {
    const text = await req.text();
    if (!text.trim()) return {};

    try {
        const data: unknown = JSON.parse(text);
        return typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
    } catch {
        throw new AppError("Invalid JSON in request body", 400);
    }
};

export const appUrl = (req: NextRequest) => process.env.FRONTEND_URL || req.nextUrl.origin;
