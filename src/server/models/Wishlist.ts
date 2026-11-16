import { Schema, Types, model, Model, models } from "mongoose";

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

export const Wishlist = (models.Wishlist as Model<IWishlist> | undefined) ?? model<IWishlist>("Wishlist", wishlistSchema);