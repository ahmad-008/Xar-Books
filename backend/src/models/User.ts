import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    profilePicture?: string;
    phoneNumber?: string;
    agreeTerms: boolean;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,

        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            maxlength: [72, "Password must be at most 72 characters"],
            select: false,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        profilePicture: { type: String },
        phoneNumber: { type: String, trim: true },
        agreeTerms: { type: Boolean, required: true },
        isEmailVerified: { type: Boolean, default: false },
        emailVerificationToken: { type: String, select: false },
        emailVerificationExpires: { type: Date, select: false },
        passwordResetToken: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false },
    },
    {timestamps: true}
);

// hash the password before saving it
userSchema.pre("save", async function(){
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12)
});

export const User = model<IUser>("User", userSchema);