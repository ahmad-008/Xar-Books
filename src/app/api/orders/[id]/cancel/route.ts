import { handle } from "@/server/utils/http";
import { cancelOrder } from "@/server/controllers/order.controller";

export const POST = handle(cancelOrder);
