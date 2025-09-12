import express from "express";
import { authUser } from "../../middleware/auth.js";
import {
  createAddress,
  deleteAddress,
  getAddress,
  updateAddress,
} from "../controllers/addressControllers.js";

const addressRoutes = express.Router();

// หากจะ test โดยไม่ต้องใช้ token ให้ลบ authUser ออก
addressRoutes.get("/address", authUser, getAddress);
addressRoutes.post("/address", authUser, createAddress);
addressRoutes.patch("/address/:id", authUser, updateAddress); // ใช้เป็น .patch แทน .put
addressRoutes.delete("/address/:id", authUser, deleteAddress);

export default addressRoutes;
