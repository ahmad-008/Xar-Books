import { Router } from "express";
import { createProduct, getProductById, getProducts, deleteProduct, getMyProducts } from "../controllers/product.controller";
import { requireAuth } from "../middleware/requireAuth";
import { uploadImages } from "../middleware/upload";

const router = Router();

router.get("/", getProducts);
router.get("/mine", requireAuth, getMyProducts);
router.get("/:id",getProductById);
router.post("/",requireAuth, uploadImages, createProduct);
router.delete("/:id", requireAuth, deleteProduct);

export default router;

