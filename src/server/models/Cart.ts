import { Schema, Types, model, Model, models } from "mongoose";

export interface ICart {
    user: Types.ObjectId;
    items: Types.ObjectId[];
}

const cartSchema = new Schema<ICart>(
    {
        user:{
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

export const Cart = (models.Cart as Model<ICart> | undefined) ?? model<ICart>("Cart", cartSchema);