import { handle } from "@/server/utils/http";
import { updateProductImages } from "@/server/controllers/product.controller";

export const PUT = handle(updateProductImages);
