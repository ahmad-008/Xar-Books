import { ActivityLog, IActivityLog } from "../models/ActivityLog";

export const logActivity = async (admin: string, action:IActivityLog["action"], targetId: string, label: string) => {
    try{
        await ActivityLog.create({admin, action, targetId, label: label.slice(0, 200)});
    } catch (error) {
        console.error("Activity log failed:", error);
    }
};