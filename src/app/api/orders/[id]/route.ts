import { handle } from "@/server/utils/http";
import { getOrderById } from "@/server/controllers/order.controller";

export const GET = handle(getOrderById);
