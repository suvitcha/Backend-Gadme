import express from "express";

import {
  getProductsByName,
  getAllProducts,
} from "../controllers/productsUserControllers.js";

const router = express.Router();

router.get("/productdetail", getProductsByName);

router.get("/productlist", getAllProducts);

// router.get("/", (_req, res, next) => {
//   try {
//     res.status(200).send("Hello React");
//   } catch (err) {
//     next(err);
//   }
// });

export default router;
