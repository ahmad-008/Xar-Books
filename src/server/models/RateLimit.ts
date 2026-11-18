import{Schema, model, Model,models} from "mongoose";

export interface IRateLimit {
    key: string;
    count: number;
    expiresAt: Date;
}

const rateLimitSchema = new Schema<IRateLimit>({
    key: {type: String, required: true, unique: true},
    count: {type: Number, required: true},
    expiresAt: {type: Date, required: true, expires: 0},
});

export const RateLimit = (models.RateLimit as Model<IRateLimit> | undefined) ?? model<IRateLimit>("RateLimit", rateLimitSchema);