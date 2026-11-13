import { Schema, Types, model } from "mongoose";

export interface IWishlist {
    user: Types.ObjectId;
    items: Types.ObjectId[];
}

const wishlistSchema = new Schema<IWishlist>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,

        },
        items: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    {timestamps: true}
);

export const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);