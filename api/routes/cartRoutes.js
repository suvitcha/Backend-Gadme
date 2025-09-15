import express from "express";

import {
  getCartByUser,
  addCartItem,
  countCartByUser,
  deleteCart,
  productQty,
  deleteCartById,
} from "../controllers/cartControllers.js";

const router = express.Router();

router.get("/cart", getCartByUser);

router.post("/cart", addCartItem);

router.delete("/cart", deleteCart);

router.get("/cart/count", countCartByUser);

router.put("/cart/:itemId", productQty);

router.delete("/cart/:itemId", deleteCartById);
export default router;
