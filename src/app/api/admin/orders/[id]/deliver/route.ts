import { handle } from "@/server/utils/http";
import { adminDeliverOrder } from "@/server/controllers/admin.controller";

export const POST = handle(adminDeliverOrder);