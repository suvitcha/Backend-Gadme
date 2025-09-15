import { User } from "../../models/User.js";
import { Order } from "../../models/Order.js";

/**
 * GET /orders
 * เห็นเฉพาะของ userId
 */
export const getOrders = async (req, res) => {
  try {
    const { userId } = req.query; // mock role user แทน auth

    if (!userId) return res.status(400).json({ message: "userId is required" });

    const orders = await Order.find({ user_id: userId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get orders", error: err.message });
  }
};

/**
 * POST /orders
 * body: { userId, shippingAddressId, paymentMethod, couponCode? }
 */
export const createOrder = async (req, res) => {
  try {
    const { userId, shippingAddressId, paymentMethod, couponCode } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // filter cart ที่ checkout
    const checkoutItems = user.user_cart.filter(
      (c) => c.product_status === "Checkout"
    );
    if (checkoutItems.length === 0) {
      return res.status(400).json({ message: "No items to checkout" });
    }

    // หา address
    const shippingAddress = user.user_address.id(shippingAddressId);
    if (!shippingAddress) {
      return res.status(400).json({ message: "Invalid shipping address" });
    }

    // คำนวณราคา
    const order_subtotal = checkoutItems.reduce(
      (sum, item) => sum + item.product_price * item.product_qty,
      0
    );
    const order_shippingFee = 50;
    let order_discount = 0;
    if (couponCode === "DISCOUNT10") order_discount = order_subtotal * 0.1;
    const order_total = order_subtotal + order_shippingFee - order_discount;

    // map cart → order_items
    const order_items = checkoutItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      product_color: item.product_color,
      product_qty: item.product_qty,
      product_price: item.product_price,
      product_subtotal: item.product_price * item.product_qty,
    }));

    // create order
    const order = await Order.create({
      user_id: user._id,
      order_subtotal,
      order_shippingFee,
      order_discount,
      order_total,
      order_items,
      order_shipping_address: shippingAddress,
      order_payment: {
        method: paymentMethod,
        status: "pending",
      },
    });

    // ล้าง cart (เฉพาะที่ checkout)
    user.user_cart = user.user_cart.filter(
      (c) => c.product_status !== "Checkout"
    );
    await user.save();

    res.status(201).json({ message: "Order created", order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create order", error: err.message });
  }
};

/**
 * GET /orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // mock auth

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user_id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get order", error: err.message });
  }
};

/**
 * POST /orders/:id/cancel
 * เฉพาะ user owner
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user_id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["pending", "paid"].includes(order.order_status)) {
      return res.status(400).json({ message: "Cannot cancel this order" });
    }

    order.order_status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to cancel order", error: err.message });
  }
};
