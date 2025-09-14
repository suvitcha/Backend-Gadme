import express from "express";

import {
  getCartByUser,
  addCartItem,
  countCartByUser,
  deleteCart,
} from "../controllers/cartControllers.js";

const router = express.Router();

router.get("/cart", getCartByUser);

router.post("/cart", addCartItem);

router.delete("/cart", deleteCart);

router.get("/cart/count", countCartByUser);

export default router;
