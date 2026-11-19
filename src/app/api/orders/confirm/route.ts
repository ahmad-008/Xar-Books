import { handle } from "@/server/utils/http";
import { confirmCheckout } from "@/server/controllers/order.controller";

export const GET = handle(confirmCheckout);
