import { Router } from "express";
import {
  createOrderFromCartDev,
  getOrderByIdDev,
} from "../controllers/ordersController.js";

const router = Router();

router.post("/", createOrderFromCartDev);
router.get("/:id", getOrderByIdDev);

export default router;
