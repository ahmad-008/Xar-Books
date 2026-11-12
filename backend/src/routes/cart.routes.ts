import { Router } from "express";
import { addToCart, clearCart, getCart, removeFromCart } from "../controllers/cart.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

export default router;
