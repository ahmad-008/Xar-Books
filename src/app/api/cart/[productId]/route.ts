import { handle } from "@/server/utils/http";
import { removeFromCart } from "@/server/controllers/cart.controller";

export const DELETE = handle(removeFromCart);
