import { HydratedDocument } from "mongoose";
import { IUser } from "../models/User";


export const toPublicUser= (user: HydratedDocument<IUser>) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    phoneNumber: user.phoneNumber,
    profilePicture: user.profilePicture,
});


