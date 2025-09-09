import express from "express";

import { getAllProductsByName } from "../controllers/productsUserControllers.js";

const router = express.Router();

router.get("/productsuser", getAllProductsByName);

// router.get("/", (_req, res, next) => {
//   try {
//     res.status(200).send("Hello React");
//   } catch (err) {
//     next(err);
//   }
// });

export default router;
