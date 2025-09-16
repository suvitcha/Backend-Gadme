import mongoose from "mongoose";
import { Order } from "../../models/Order.js";
import { User } from "../../models/User.js";
import { Product } from "../../models/Product.js";

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ error: true, message: "Order not found" });
    res.json({ error: false, order });
  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
};
