import { handle } from "@/server/utils/http";
import { updateSellingStatus } from "@/server/controllers/order.controller";

export const PATCH = handle(updateSellingStatus);
