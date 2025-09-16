import express from "express";

import { getOrderById } from "../controllers/ordersController.js";

const router = express.Router();

router.get("/order", getOrderById);

export default router;
