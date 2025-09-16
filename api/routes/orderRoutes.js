import express from "express";
import {
  getOrders,
  createOrder,
  getOrderById,
  cancelOrder,
} from "../controllers/orderControllers.js";

const router = express.Router();

// User-only routes
router.get("/order", getOrders);
router.post("/order", createOrder);
router.get("/order/:id", getOrderById);
router.post("/order/:id/cancel", cancelOrder);

export default router;
