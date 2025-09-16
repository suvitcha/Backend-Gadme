import mongoose from "mongoose";
import { User } from "../../models/User.js";

/* function */
function computeCartSummary(cartItems = []) {
  const count = cartItems.reduce((s, i) => s + Number(i?.product_qty || 0), 0);
  const subtotal = cartItems.reduce((s, i) => {
    const p =
      i?.product_id && typeof i.product_id === "object" ? i.product_id : null;
    const price = Number(i?.product_price ?? p?.product_price ?? 0);
    return s + price * Number(i?.product_qty || 0);
  }, 0);
  return { count, subtotal };
}

async function readUserCart(userId) {
  const user = await User.findById(userId)
    .select("user_cart")
    .populate({
      path: "user_cart.product_id",
      model: "Product",
      select: "product_name product_image product_price product_color stock",
    })
    .lean();

  const cartItems = user?.user_cart ?? [];
  const { count, subtotal } = computeCartSummary(cartItems);
  return { cartItems, count, subtotal };
}

/* function */

export const getCartByUser = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId("68c411b52e822abad46f8334");
    // const userId = req.user?.id; // มาจาก middleware JWT เช่น decode token

    const user = await User.findById(userId)
      .select("user_cart")
      .populate({
        path: "user_cart.product_id",
        model: "Product",
        select:
          "product_id product_name product_image product_price product_color stock", // _id จะติดมาด้วยอยู่แล้ว เว้นแต่สั่ง -_id
      })
      .lean();

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const cartItems = user.user_cart ?? [];
    const count = cartItems.reduce((s, i) => s + (i.product_qty || 0), 0);
    // รองรับทั้งกรณีเก็บราคาในรายการ cart เอง และกรณีต้องอ่านจาก product ที่ populate มา
    const subtotal = cartItems.reduce((s, i) => {
      const price = i.product_price ?? i.product_id?.product_price ?? 0;
      return s + price * (i.product_qty || 0);
    }, 0);

    return res.status(200).json({
      error: false,
      cartItems,
      count,
      subtotal,
      message: "Get cart successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const addCartItem = async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId("68c411b52e822abad46f8334");
  const _id = userId;
  try {
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

    const pid = new mongoose.Types.ObjectId(product_id);
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

export const productQty = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId("68c411b52e822abad46f8334");
    // const userId = resolveUserId(req);

    const { itemId } = req.params;
    const { product_qty } = req.body;

    if (!mongoose.isValidObjectId(itemId)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid cart item id" });
    }
    const qty = Number(product_qty);
    if (!Number.isFinite(qty) || qty < 1) {
      return res
        .status(400)
        .json({ error: true, message: "product_qty must be a number >= 1" });
    }

    // (Optional) Check stock limit if Product has stock field
    const userDoc = await User.findOne({
      _id: userId,
      "user_cart._id": itemId,
    }).select("user_cart.$");
    if (!userDoc)
      return res
        .status(404)
        .json({ error: true, message: "Cart item not found" });
    const item = userDoc.user_cart?.[0];

    if (item?.product_id) {
      const prodId = item.product_id?._id || item.product_id; // works for ObjectId or populated object
      try {
        const prod = await Product.findById(prodId).select("stock");
        if (prod?.stock != null && qty > prod.stock) {
          return res
            .status(400)
            .json({ error: true, message: `จำนวนเกิน Stock (${prod.stock})` });
        }
      } catch {}
    }

    await User.updateOne(
      { _id: userId, "user_cart._id": itemId },
      { $set: { "user_cart.$.product_qty": qty } }
    );

    const { cartItems, count, subtotal } = await readUserCart(userId);
    return res.json({
      error: false,
      cartItems,
      count,
      subtotal,
      message: "Updated quantity",
    });
  } catch (err) {
    console.error("PUT /cart/:itemId error", err);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
};

export const deleteCartById = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId("68c411b52e822abad46f8334");
    // const userId = resolveUserId(req);
    // if (!userId)
    //   return res.status(401).json({ error: true, message: "Unauthorized" });

    const { itemId } = req.params;
    if (!mongoose.isValidObjectId(itemId)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid cart item id" });
    }

    await User.updateOne(
      { _id: userId },
      { $pull: { user_cart: { _id: itemId } } }
    );

    const { cartItems, count, subtotal } = await readUserCart(userId);
    return res.json({
      error: false,
      cartItems,
      count,
      subtotal,
      message: "Removed item",
    });
  } catch (err) {
    console.error("DELETE /cart/:itemId error", err);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
};
