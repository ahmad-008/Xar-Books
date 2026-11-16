import { Schema, Types, model, Model, models } from "mongoose";


export const PAYMENT_METHODS = ["COD", "Card"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "failed"] as const;
export const ORDER_STATUSES = ["processing", "shipped", "delivered","cancelled"] as const;
export const ITEM_STATUSES = ["processing", "shipped", "delivered"] as const;


export interface IOrderItem {
    product: Types.ObjectId;
    seller: Types.ObjectId;
    title: string;
    image: string;
    price: number;
    shippingCharge: number;
    status: (typeof ITEM_STATUSES)[number];
}

export interface IShippingAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface IOrder {
    buyer: Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    itemsTotal: number;
    shippingTotal: number;
    totalAmount: number;
    paymentMethod: (typeof PAYMENT_METHODS)[number];
    paymentStatus: (typeof PAYMENT_STATUSES)[number];
    orderStatus: (typeof ORDER_STATUSES)[number];
    stripeSessionId?: string;
    createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
    {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        shippingCharge: { type: Number, required: true, min: 0 },
        status: {type: String, enum: ITEM_STATUSES, default: "processing"},
    },
    { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
    {
        fullName: { type: String, required: true, trim: true, maxlength: 100 },
        phone: { type: String, required: true, trim: true, maxlength: 20 },
        addressLine1: { type: String, required: true, trim: true, maxlength: 200 },
        addressLine2: { type: String, trim: true, maxlength: 200 },
        city: { type: String, required: true, trim: true, maxlength: 100 },
        state: { type: String, required: true, trim: true, maxlength: 100 },
        postalCode: { type: String, required: true, trim: true, maxlength: 20 },
        country: { type: String, required: true, trim: true, maxlength: 100 },
    },
    { _id: false }
);

const orderSchema = new Schema<IOrder>({
    buyer: {type: Schema.Types.ObjectId, ref: "User", required:true, index: true},
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (items: IOrderItem[]) => items.length > 0,
            message: "An order needs at least one book",
        },
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
        itemsTotal: { type: Number, required: true, min: 0 },
        shippingTotal: { type: Number, required: true, min: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
        paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
        orderStatus: { type: String, enum: ORDER_STATUSES, default: "processing" },
        stripeSessionId: { type: String, index: true, sparse: true },

},
    {timestamps : true}
);

export const Order = (models.Order as Model<IOrder> | undefined) ?? model<IOrder>("Order", orderSchema);
