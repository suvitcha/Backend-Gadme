import mongoose from "mongoose";
import { User } from "../../models/User.js";

export const getCartByUser = async (req, res, next) => {
  try {
    const user = await User.findOne();
    res.status(200).json({
      error: false,
      user: user,
      message: "Get product sucessfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const addCartItem = async (req, res, next) => {
  const userId = "68c411b52e822abad46f8334";
  try {
    const { _id } = new mongoose.Types.ObjectId(userId);
    const {
      product_id,
      product_name,
      product_image,
      product_color,
      product_price,
      product_qty,
      product_status, // optional (default: "Selected")
    } = req.body;

    // ตรวจ required fields ให้ครบ
    if (
      !product_id ||
      !product_name ||
      !product_image ||
      !product_color ||
      product_price == null ||
      product_qty == null
    ) {
      return res
        .status(400)
        .json({ error: true, message: "Missing cart item fields" });
    }

    const pid = new mongoose.Types.ObjectId(userId);
    const user = await User.findById({ _id });
    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    user.user_cart.push({
      product_id: pid,
      product_name,
      product_image,
      product_color,
      product_price,
      product_qty,
      product_status: product_status || "Selected",
    });

    await user.save(); // ไม่ re-hash password เพราะ isModified("user_password") เป็น false
    return res
      .status(201)
      .json({ error: false, cart: user.user_cart, message: "Added to cart" });
  } catch (err) {
    // ถ้า product_id ไม่ใช่ 24 hex จะโยน BSONError
    next(err);
  }
};

export const countCartByUser = async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId("68c411b52e822abad46f8334");
  try {
    //const user_id = req.user._id;
    const total = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$user_cart" },
      { $match: { "user_cart.product_status": "Selected" } },
      { $group: { _id: null, totalQty: { $sum: "$user_cart.product_qty" } } },
    ]);
    res.json({ error: false, count: total });
  } catch (err) {
    next(err);
  }
};

export const deleteCart = async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId("68c411b52e822abad46f8334");
  try {
    await User.updateOne({ _id: userId }, { $set: { user_cart: [] } });
    return res.json({ error: false, message: "Cart cleared", count: 0 });
  } catch (e) {
    next(e);
  }
};
