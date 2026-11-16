import { handle } from "@/server/utils/http";
import { createProduct, getProducts } from "@/server/controllers/product.controller";

export const GET = handle(getProducts);
export const POST = handle(createProduct);
