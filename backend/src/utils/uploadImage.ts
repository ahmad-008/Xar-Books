import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";


export const uploadImage = (file:Express.Multer.File) =>
    new Promise<string>((resolve, reject)=>{
        const stream =  cloudinary.uploader.upload_stream(
            {
                folder: "xar-books/products",
                resource_type: "image"
            },
            (error, result?: UploadApiResponse) => {
                if (error || !result)
                    return reject(error ?? new Error("uploaf failed"));
                resolve(result.secure_url);
            }
        );
        stream.end(file.buffer);
    });


    export const deleteImage = async ( url: string) => {
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
        if(match){
            await cloudinary.uploader.destroy(match[1]);
        }
    };