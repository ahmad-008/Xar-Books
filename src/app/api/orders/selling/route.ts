import { handle } from "@/server/utils/http";
import { getSellingOrders } from "@/server/controllers/order.controller";

export const GET = handle(getSellingOrders);
