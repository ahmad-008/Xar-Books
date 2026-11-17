import { handle } from "@/server/utils/http";
import { deleteProduct, getProductById, updateProduct } from "@/server/controllers/product.controller";

export const GET = handle(getProductById);
export const PATCH = handle(updateProduct);
export const DELETE = handle(deleteProduct);
