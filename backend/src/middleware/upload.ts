import multer from "multer";
import { AppError } from "../utils/AppError";


const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const uploadImages = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 1024 * 1024, files: 4},
    fileFilter(req, file, cb) {
        if (ALLOWED_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError("Only JPG, PNG or WEBP images are allowed",400));
        }
        
    },
}).array("images", 4);