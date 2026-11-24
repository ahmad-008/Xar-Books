import { handle } from "@/server/utils/http";
import { getOrders } from "@/server/controllers/admin.controller";

export const GET = handle(getOrders);