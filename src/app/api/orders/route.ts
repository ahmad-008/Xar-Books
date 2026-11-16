import { handle } from "@/server/utils/http";
import { createOrder, getMyOrders } from "@/server/controllers/order.controller";

export const GET = handle(getMyOrders);
export const POST = handle(createOrder);
