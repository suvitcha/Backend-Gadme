import express from "express";

import {
  getProductsByName,
  getAllProducts,
} from "../controllers/productsUserControllers.js";

const router = express.Router();

router.get("/productdetail/:name", getProductsByName);

router.get("/productlist", getAllProducts);

export default router;
