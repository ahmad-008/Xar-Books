import { handle } from "@/server/utils/http";
import { confirmReceived } from "@/server/controllers/order.controller";

export const POST = handle(confirmReceived);
