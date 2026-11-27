import {Schema, Types, model, Model, models} from "mongoose";

export const ACTIVITY_ACTIONS = ["remove_book", "block_user", "unblock_user", "cancel_order","deliver_order", "edit_book"] as const;


export interface IActivityLog {
    admin: Types.ObjectId;
    action: (typeof ACTIVITY_ACTIONS)[number];
    targetId: Types.ObjectId;
    label:string;
    createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
    {
        admin: {type: Schema.Types.ObjectId, ref: "User", required: true},
        action: {type: String, enum: ACTIVITY_ACTIONS, required: true},
        targetId: {type: Schema.Types.ObjectId, required: true},
        label: {type: String, required: true, maxlength: 200},
    },
    {timestamps: {createdAt: true, updatedAt: false}}
);

activityLogSchema.index({createdAt: -1});

export const ActivityLog = (models.ActivityLog as Model<IActivityLog> | undefined) ?? model<IActivityLog>("ActivityLog", activityLogSchema);