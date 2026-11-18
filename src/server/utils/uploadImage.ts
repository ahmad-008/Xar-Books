import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import { AppError } from "./AppError";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 1024 * 1024;
export const MAX_FILES = 4;

export const checkImage = (file:File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
            throw new AppError("Only JPG, PNG or WEBP images are allowed", 400);
        }
    if (file.size > MAX_SIZE) {
            throw new AppError("Each image must be 1 MB or smaller", 400);
        }    
}


export const readImages = (formData: FormData) => {
    const files = formData.getAll("images").filter((value): value is File => value instanceof File);

    if (files.length > MAX_FILES) {
        throw new AppError("You can upload up to 4 images", 400);
    }

    files.forEach(checkImage);
    return files;
};

export const uploadImage = async (file: File, folder = "xar-books/products") => {
    const buffer = Buffer.from(await file.arrayBuffer());

    return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result?: UploadApiResponse) => {
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
