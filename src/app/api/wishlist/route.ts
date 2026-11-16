import { handle } from "@/server/utils/http";
import { addToWishlist, getWishlist } from "@/server/controllers/wishlist.controller";

export const GET = handle(getWishlist);
export const POST = handle(addToWishlist);
