import { handle } from "@/server/utils/http";
import { setUserBlocked } from "@/server/controllers/admin.controller";

export const PATCH = handle(setUserBlocked);