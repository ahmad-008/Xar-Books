import { SortOrder, isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { IProduct, Product } from "../models/Product";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { requireUserId } from "../utils/auth";
import { Params, readJson } from "../utils/http";
import { checkPrices } from "../utils/validate";
import { MAX_FILES, checkImage, deleteImage, readImages, uploadImage } from "../utils/uploadImage";
import { blockedUserIds } from "../utils/blockedUsers";
import { logActivity } from "../utils/activity";

const toNumber = (value: unknown) =>
    typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;

const text = (value: FormDataEntryValue | null) => (typeof value === "string" ? value : undefined);


export const createProduct = async (req: NextRequest) => {
    const user = await User.findById(await requireUserId(req));
    if (!user) {
        throw new AppError("Please log in to continue", 401);
    }

    if (!user.isEmailVerified) {
        throw new AppError("Please verify your email before selling a book", 403);
    }

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        throw new AppError("Invalid form data", 400);
    }

    const files = await readImages(formData);
    if (files.length === 0) {
        throw new AppError("Add at least one image", 400);
    }

    const price = toNumber(formData.get("price"));
    const finalPrice = toNumber(formData.get("finalPrice"));
    const shippingCharge = text(formData.get("shippingCharge")) ? toNumber(formData.get("shippingCharge")) : 0;

    if (!Number.isFinite(price) || !Number.isFinite(finalPrice) || !Number.isFinite(shippingCharge)) {
        throw new AppError("Price, selling price and shipping must be numbers", 400);
    }

        checkPrices(price, finalPrice, shippingCharge);


    const data = {
        title: text(formData.get("title")),
        subject: text(formData.get("subject")),
        category: text(formData.get("category")) as IProduct["category"],
        condition: text(formData.get("condition")) as IProduct["condition"],
        classType: text(formData.get("classType")),
        author: text(formData.get("author")),
        edition: text(formData.get("edition")),
        description: text(formData.get("description")),
        price,
        finalPrice,
        shippingCharge,
        seller: user._id,
    };

    await Product.validate({ ...data, images: files.map(() => "pending") });

    const images = await Promise.all(files.map((file) => uploadImage(file)));
    const product = await Product.create({ ...data, images });

    return NextResponse.json(
        { success: true, message: "Book listed for sale", data: product },
        { status: 201 }
    );
};

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toList = (values: string[]) => values.filter((item) => item.trim() !== "");

export const getProducts = async (req: NextRequest) => {
    const query = req.nextUrl.searchParams;
    const filter: Record<string, unknown> = { isSold: false, seller: {$nin: await blockedUserIds()} };


    const categories = toList(query.getAll("category"));
    if (categories.length) filter.category = { $in: categories };

    const conditions = toList(query.getAll("condition"));
    if (conditions.length) filter.condition = { $in: conditions };

    const classTypes = toList(query.getAll("classType"));
    if (classTypes.length) filter.classType = { $in: classTypes };

    const search = (query.get("search") ?? "").trim().slice(0,100);
    if (search) {
        filter.$text = {$search: search};
        if(!(await Product.exists(filter))){
            delete filter.$text;
            const regex = new RegExp(escapeRegex(search), "i");
            filter.$or = [{title: regex}, {author: regex}, {subject: regex}];
        }
    }

    const sort = query.get("sort");
    const sortBy: Record<string, SortOrder> =
        sort === "price-asc" ? { finalPrice: 1 } :
            sort === "price-desc" ? { finalPrice: -1 } :
                { createdAt: -1 };

    const page = Math.max(1, Math.floor(Number(query.get("page"))) || 1);
    const limit = Math.min(50, Math.max(1, Math.floor(Number(query.get("limit"))) || 12));

    const [products, total] = await Promise.all([
        Product.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit).populate("seller", "name"),
        Product.countDocuments(filter),
    ]);

    return NextResponse.json({
        success: true,
        data: products,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
};

export const getProductById = async (_req: NextRequest, { id }: Params) => {
    if (!isValidObjectId(id)) {
        throw new AppError("Book not found", 404);
    }

    const product = await Product.findById(id).populate("seller", "name");
    if (!product) {
        throw new AppError("Book not found", 404);
    }

    return NextResponse.json({ success: true, data: product });
};

export const getMyProducts = async (req: NextRequest) => {
    const products = await Product.find({ seller: await requireUserId(req) }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products });
};

export const deleteProduct = async (req: NextRequest, { id }: Params) => {
    const userId = await requireUserId(req);

    if (!isValidObjectId(id)) {
        throw new AppError("Book not found", 404);
    }

    const product = await Product.findOne({ _id: id, seller: userId });
    if (!product) {
        throw new AppError("Book not found", 404);
    }

    if (product.isSold) {
        throw new AppError("A sold book can't be deleted", 400);
    }

    await product.deleteOne();

    const results = await Promise.allSettled(product.images.map(deleteImage));
    results.forEach((result) => {
        if (result.status === "rejected") console.error("Image delete failed:", result.reason);
    });

    return NextResponse.json({ success: true, message: "Book deleted" });
};

const TEXT_FIELDS = ["title", "subject", "category", "condition", "classType","author","edition","description"] as const;
const OPTIONAL_FIELDS =["author","edition", "description"];
const NUMBER_FIELDS = ["price", "finalPrice","shippingCharge"] as const;
const findEditable = async (userId: string, id: string) => {
    const user = await User.findById(userId).select("role");
    const isAdmin = user?.role === "admin";
    const product = await Product.findOne(isAdmin ? {_id: id} : {_id: id, seller: userId});
    return {product, isAdmin};
};

export const updateProduct = async (req: NextRequest, { id }: Params) => {
    const userId = await requireUserId(req);

    if (!isValidObjectId(id)) {
        throw new AppError("Book not found", 404);
    }

    const {product, isAdmin} = await findEditable(userId, id);
    if (!product) {
        throw new AppError("Book not found", 404);
    }

    if (product.isSold) {
        throw new AppError("A sold book can't be edited", 400);
    }

    const body = await readJson(req);

    for (const field of TEXT_FIELDS) {
        const value = body[field];
        if (value === undefined) continue;
        if (typeof value !== "string") {
            throw new AppError(`${field} must be text`, 400);
        }
        const trimmed = value.trim();
        if (!trimmed && OPTIONAL_FIELDS.includes(field)) {
            product.set(field, undefined);
        } else {
            product.set(field, trimmed);
        }
    }

    for (const field of NUMBER_FIELDS) {
        const value = body[field];
        if (value === undefined) continue;
        if (typeof value !== "number" || !Number.isFinite(value)) {
            throw new AppError("Price, selling price and shipping must be numbers", 400);
        }
        product.set(field, value);
    }

    checkPrices(product.price, product.finalPrice, product.shippingCharge);

    await product.save();
    if(isAdmin) await logActivity(userId, "edit_book", id, product.title);

    return NextResponse.json({ success: true, message: "Book updated", data: product });
};

export const deleteImages = async (urls: string[]) => {
    const results = await Promise.allSettled(urls.map(deleteImage));
    results.forEach((result)=>{
        if(result.status === "rejected")
            console.error("Image deleted failed:",result.reason);

    });

};

export const updateProductImages = async (req: NextRequest, { id }: Params) => {
    const userId = await requireUserId(req);

    if(!isValidObjectId(id)){
        throw new AppError("Book not found", 404);
    }

    const { product } = await findEditable(userId, id);
    if(!product){
        throw new AppError("Book not found", 404);
    }

    if (product.isSold) {
        throw new AppError("A sold book can't be edited", 400);
    }

    let formData: FormData;
    try{
        formData = await req.formData();

    } catch {
        throw new AppError("Invalid form data", 400);
    }

    const photos = formData.getAll("photos");
    if (photos.length === 0) {
        throw new AppError("Add at least one image", 400);
    }
    if (photos.length > MAX_FILES) {
        throw new AppError("You can upload up to 4 images", 400);
    }

    const current = [...product.images];
    for (const photo of photos) {
        if (typeof photo === "string") {
            if (!current.includes(photo)) {
                throw new AppError("One of the photos doesn't belong to this book", 400);
            }
        } else {
         await checkImage(photo);
        }
    }

    const keptUrls = photos.filter((photo): photo is string => typeof photo === "string");
    if (new Set(keptUrls).size !== keptUrls.length) {
        throw new AppError("The same photo was added twice", 400);
    }

    const uploaded: string[] = [];
    try {
        const images = await Promise.all(
            photos.map(async (photo) => {
                if (typeof photo === "string") return photo;
                const url = await uploadImage(photo);
                uploaded.push(url);
                return url;
            })
        );

        product.images = images;
        await product.save();
    } catch (error) {
        await deleteImages(uploaded);
        throw error;
    }

    await deleteImages(current.filter((url) => !keptUrls.includes(url)));

    return NextResponse.json({ success: true, message: "Photos updated", data: product });
};
