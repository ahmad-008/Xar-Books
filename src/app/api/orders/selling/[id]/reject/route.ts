import {handle} from "@/server/utils/http";
import { rejectSellingOrder } from "@/server/controllers/order.controller";

export const POST = handle(rejectSellingOrder);