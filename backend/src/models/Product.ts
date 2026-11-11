import { Schema, Types, model } from "mongoose";

export const CONDITIONS = ["Excellent", "Good", "Fair"] as const;

export const CATEGORIES = [
    "College Books (Higher Education Textbooks)",
    "Exam/Test Preparation Books",
    "Reading Books (Novels, Children, Business, Literature, History, etc.)",
    "School Books (up to 12th)",

] as const;



export interface IProduct {
    title: string;
    images: string[];
    subject: string;
    category: (typeof CATEGORIES)[number];
    condition: (typeof CONDITIONS)[number];
    classType: string;
    price: number;
    finalPrice: number;
    shippingCharge: number;
    author?:string;
    edition?: string;
    description?: string;
    seller: Types.ObjectId;
    isSold: boolean;
}

const productSchema = new Schema<IProduct>(
    {
        title: {
            type: String, 
            required: true,
            trim: true,
            maxlength: 200
        
        },

        images : {
            type: [String],
            validate: {
                validator: (images: string[]) => images.length >=1 && images.length <=4,
                message: "Add between 1 and 4 images",
            },
        },

        subject:{
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

         category: {
            type: String,
            required: true,
            enum: CATEGORIES
        },

        condition: { 
            type: String, 
            required: true, 
            enum: CONDITIONS 
        },

        classType: { 
            type: String, 
            required: true, 
            trim: true, 
            maxlength: 50 
        },

        price: { 
            type: Number, 
            required: true, 
            min: 0 
        },

        finalPrice: { 
            type: Number, 
            required: true, 
            min: 0 
        },

        shippingCharge: { 
            type: Number, 
            default: 0, 
            min: 0 
        },

        author: { 
            type: String, 
            trim: true, 
            maxlength: 100 
        },
        
        edition: { 
            type: String, 
            trim: true, 
            maxlength: 100 
        },

        description: { 
            type: String, 
            trim: true, 
            maxlength: 2000 
        },

        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        isSold: {
            type: Boolean,
            default: false
        },

    },
    {timestamps: true}
);

export const Product = model<IProduct>("Product", productSchema);