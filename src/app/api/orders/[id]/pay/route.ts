import {handle} from "@/server/utils/http";
import { payOrder } from "@/server/controllers/order.controller";

export const POST = handle(payOrder);