import {User} from "../models/User";

export const blockedUserIds = async () => {
    const users= await User.find({isBlocked: true}).select("_id").lean();
    return users.map((user) => user._id.toString());
};