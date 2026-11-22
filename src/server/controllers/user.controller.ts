import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { requireUserId, setAuthCookie } from "../utils/auth";
import { readJson } from "../utils/http";
import { toPublicUser } from "../utils/publicUser";
import { rateLimit } from "../utils/rateLimit";
import { deleteImage, readImages, uploadImage } from "../utils/uploadImage";
import { checkName, checkPassword } from "../utils/validate";



const PHONE_PATTERN = /^[0-9+\-\s()]{7,20}$/;

const findUser = async (req: NextRequest) => {
    const user = await User.findById(await requireUserId(req));

    if(!user){
        throw new AppError("Please log in to continue", 401);
    }
    return user;
};

export const updateProfile = async (req: NextRequest) => {
    const user= await findUser(req);
    const {name, phoneNumber} = await readJson(req);

    if (name !== undefined){
        if (typeof name !== "string"){
            throw new AppError("Name must be 2 to 50 characters", 400);
        }
        user.name = checkName(name);
    }

    if(phoneNumber !== undefined) {
        if(typeof phoneNumber !== "string"){
            throw new AppError("Enter a valid phone number",400);
        }

        const phone = phoneNumber.trim();
        if(phone && !PHONE_PATTERN.test(phone)){
            throw new AppError("Enter a valid phone number", 400);
        }

        user.phoneNumber = phone || undefined;
    }
     await user.save();
     return NextResponse.json({
        success: true,
        message: "Profile updated",
        data: toPublicUser(user)
     });
};


export const updateAvatar = async (req: NextRequest) => {
    const user = await findUser(req);

    let formData: FormData;
    try{
        formData =  await req.formData();
    } catch {
        throw new AppError("Invalid form data", 400);
    }

    const files = readImages(formData);
    if (files.length !== 1){
        throw new AppError("Choose one image",400);
    }

    const oldPicture= user.profilePicture;
    user.profilePicture = await uploadImage(files[0], "xar-books/avatars");
    await user.save();

    if (oldPicture){
        await deleteImage(oldPicture).catch((error)=> console.error("Old avatar delete failed:", error));

    }

   return NextResponse.json({
        success: true,
        message: "Profile picture updated",
        data: toPublicUser(user)
     });
};

export const changePassword = async(req: NextRequest) => {
    const userId = await requireUserId(req);
    const {currentPassword, newPassword} = await readJson(req);

    if (typeof currentPassword !== "string" || typeof newPassword !== "string"){
        throw new AppError("Current and new password are required", 400);
    }
    await rateLimit(`password:${userId}`, 5, 15);

    const user = await User.findById(userId).select("+password");
    if(!user){
        throw new AppError("Please log in to continue", 401);
    }

    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    if(!isCorrect){
        throw new AppError("Your current password is wrong",400);
    }

    if (currentPassword === newPassword){
        throw new AppError("Choose a password different from your current one", 400);
    }
    checkPassword(newPassword);

    user.password = newPassword;
    await  user.save();

    const updated = await User.findByIdAndUpdate(
        userId,
        {$inc: {tokenVersion: 1}},
        {returnDocument: "after"}
    ).select("+tokenVersion");

    const res = NextResponse.json({
        success: true, message: "Password changed"
    });
    setAuthCookie(res,userId, updated?.tokenVersion ?? 0);
    return res;
};