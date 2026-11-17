import { handle } from "@/server/utils/http";
import { changePassword } from "@/server/controllers/user.controller";

export const PATCH = handle(changePassword);
