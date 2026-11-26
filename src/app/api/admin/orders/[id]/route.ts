import { getOrderDetails } from "@/server/controllers/admin.controller";
import { handle } from "@/server/utils/http";



export const GET = handle(getOrderDetails);