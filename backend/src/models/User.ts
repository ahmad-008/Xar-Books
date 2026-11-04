import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const BCRYPT_ROUNDS = 12;

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
    agreeTerms: boolean;
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: [true, "Name is required"], trim: true },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        // select: false keeps these out of normal queries, so they can't leak by accident
        password: { type: String, required: [true, "Password is required"], select: false },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        isEmailVerified: { type: Boolean, default: false },
        agreeTerms: { type: Boolean, required: true },
        passwordChangedAt: { type: Date },
        passwordResetToken: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false },
    },
    { timestamps: true }
);

// hash the password whenever it is new or changed, so a plain one is never saved
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
});

export const User = mongoose.model<IUser>("User", userSchema);
