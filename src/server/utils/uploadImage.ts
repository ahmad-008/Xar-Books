import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import { AppError } from "./AppError";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 1024 * 1024;
export const MAX_FILES = 4;

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
    signature.every((byte, i) => bytes[offset + i] === byte);

const isRealImage = (bytes: Uint8Array) =>
    startsWith(bytes, [0xff, 0xd8, 0xff]) ||
    startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) ||
    (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8));

export const checkImage = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new AppError("Only JPG, PNG or WEBP images are allowed", 400);
    }
    if (file.size > MAX_SIZE) {
        throw new AppError("Each image must be 1 MB or smaller", 400);
    }
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if(!isRealImage(bytes)){
        throw new AppError("This file isn't a real JPG, PNG or WEBP image", 400);
    }
}


export const readImages = async (formData: FormData) => {
    const files = formData.getAll("images").filter((value): value is File => value instanceof File);

    if (files.length > MAX_FILES) {
        throw new AppError("You can upload up to 4 images", 400);
    }

    await Promise.all(files.map(checkImage));
    return files;
};

export const uploadImage = async (file: File, folder = "xar-books/products") => {
    const buffer = Buffer.from(await file.arrayBuffer());

    return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image", allowed_formats: ["jpg", "png", "webp"] },
            (error, result?: UploadApiResponse) => {
                if (error?.http_code === 400) {
                    return reject(new AppError("This image couldn't be uploaded, please try another one", 400));
                }

                if (error || !result) return reject(error ?? new Error("upload failed"));
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};

export const deleteImage = async (url: string) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
    if (match) {
        await cloudinary.uploader.destroy(match[1]);
    }
};
