import { handle } from "@/server/utils/http";
import { removeFromWishlist } from "@/server/controllers/wishlist.controller";

export const DELETE = handle(removeFromWishlist);
