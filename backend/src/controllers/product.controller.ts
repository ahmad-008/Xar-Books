import { Request, Response } from "express";
import { SortOrder, isValidObjectId } from "mongoose";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { uploadImage, deleteImage } from "../utils/uploadImage";


const toNumber = (value: unknown) =>
    typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;

export const createProduct = async (req: Request, res: Response) => {
    const user = await User.findById(req.userId);
    if (!user) {
        throw new AppError("Please log in to continue", 401);
    }

    if (!user.isEmailVerified) {
        throw new AppError("Please verify your email before selling a book", 403);
    }
    const files = (req.files ?? []) as Express.Multer.File[];
    if (files.length === 0) {
        throw new AppError("Add at least one image", 400);
    }

    const { title, subject, category, condition, classType, author, edition, description } = req.body ?? {};
    const price = toNumber(req.body?.price);
    const finalPrice = toNumber(req.body?.finalPrice);
    const shippingCharge = req.body?.shippingCharge ? toNumber(req.body.shippingCharge) : 0;

    if (!Number.isFinite(price) || !Number.isFinite(finalPrice) || !Number.isFinite(shippingCharge)) {
        throw new AppError("Price, selling price and shipping must be numbers", 400);
    }

    if (finalPrice > price) {
        throw new AppError("Selling price can't be higher than the original price", 400);
    }

    const data = {
        title, subject, category, condition, classType, author, edition, description,
        price, finalPrice, shippingCharge,
        seller: user._id,
    };

    await Product.validate({...data, images: files.map(()=> "pending")});

    const images = await Promise.all(files.map(uploadImage));
    const product = await Product.create({...data, images});

    res.status(201).json({
        success: true,
        message: "Book listed for sale",
        data: product,
    });
};

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toList = (value: unknown) : string[] => {
    const values = Array.isArray(value) ? value : [value];
    return values.filter((item): item is string => typeof item === "string" && item.trim() !== "");
};

export const getProducts = async (req: Request, res: Response) => {
    const {search, category, condition, classType, sort} = req.query;
    const filter: Record<string, unknown> = {isSold: false};

    if (typeof search === "string" && search.trim()) {
        const regex = new RegExp(escapeRegex(search.trim().slice(0,100)), "i");
        filter.$or = [{title: regex}, {author: regex}, {subject: regex}];
    }

    const categories = toList(category);
    if (categories.length) filter.category = {$in: categories};

    const conditions = toList(condition);
    if (conditions.length) filter.condition = {$in: conditions};

    const classTypes = toList(classType);
    if (classTypes.length) filter.classType = {$in: classTypes };


    const sortBy: Record<string, SortOrder> = 
    sort === "price-asc" ? { finalPrice: 1}: 
    sort === "price-desc" ? {finalPrice: -1}:
    { createdAt: -1 };

    const page = Math.max(1, Math.floor(Number(req.query.page)) || 1 );
    const limit = Math.min(50, Math.max(1, Math.floor(Number(req.query.limit))|| 12 ));

    const [products, total] = await Promise.all([
        Product.find(filter).sort(sortBy).skip((page -1) * limit).limit(limit).populate("seller", "name"),
        Product.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: products,
        pagination: {page, limit, total, pages: Math.ceil(total / limit)},
    });
};

export const getProductById = async (req: Request, res: Response) => {
    const {id} = req.params;

    if (!isValidObjectId(id)) {
        throw new AppError("Book not found", 404);
    }


    const product = await Product.findById(id).populate("seller", "name");
    if (!product) {
        throw new AppError("Book not found",404);
    }

    res.json({success: true, data: product});
};

export const getMyProducts = async ( req: Request, res: Response) => {
    const products = await Product.find({seller: req.userId}).sort({createdAt: -1});

    res.json({
        success: true,
        data: products
    });
};

export const deleteProduct = async (req: Request, res: Response) => {
    const {id} = req.params;

    if(!isValidObjectId(id)){
        throw new AppError("Book not found", 404);
    }

    const product = await Product.findOne({_id: id, seller: req.userId});
    if(!product) {
        throw new AppError("Book not found", 404);
    }

    if(product.isSold) {
        throw new AppError("A sold book can't be deleted", 400);
    }

    await product.deleteOne();

    const results = await Promise.allSettled(product.images.map(deleteImage));
    results.forEach((result)=>{
        if (result.status === "rejected")
            console.error("Image delete failed:", result.reason);
    });

    res.json({
        success: true,
        message: "Book deleted"
    });
};