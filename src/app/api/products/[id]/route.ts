import { handle } from "@/server/utils/http";
import { deleteProduct, getProductById } from "@/server/controllers/product.controller";

export const GET = handle(getProductById);
export const DELETE = handle(deleteProduct);
