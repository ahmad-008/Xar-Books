import { handle } from "@/server/utils/http";
import { getMyProducts } from "@/server/controllers/product.controller";

export const GET = handle(getMyProducts);
