import { handle } from "@/server/utils/http";
import { adminCancelOrder } from "@/server/controllers/admin.controller";

export const POST = handle(adminCancelOrder);