import { handle } from "@/server/utils/http";
import { addToCart, clearCart, getCart } from "@/server/controllers/cart.controller";

export const GET = handle(getCart);
export const POST = handle(addToCart);
export const DELETE = handle(clearCart);
