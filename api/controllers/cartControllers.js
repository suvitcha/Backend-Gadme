// api/controllers/cartControllers.js
import mongoose from "mongoose";
import { User } from "../../models/User.js";
import { Product } from "../../models/Product.js";

/* ------------------------------ Helpers ------------------------------ */

function computeCartSummary(cartItems = []) {
  const selected = cartItems.filter((it) => it.product_status === "Selected");
  const count_items = selected.reduce(
    (s, i) => s + Number(i?.product_qty || 0),
    0
  );
  const count_lines = selected.length;
  const subtotal = selected.reduce((s, i) => {
    const p =
      i?.product_id && typeof i.product_id === "object" ? i.product_id : null;
    const price = Number(i?.product_price ?? p?.product_price ?? 0);
    return s + price * Number(i?.product_qty || 0);
  }, 0);
  return { count_items, count_lines, subtotal };
}

export async function readUserCart(userId) {
  const user = await User.findById(userId)
    .select("user_cart")
    .populate({
      path: "user_cart.product_id",
      model: "Product",
      select: "product_name product_image product_price product_color stock",
    })
    .lean();

  const cartItems = user?.user_cart ?? [];
  const meta = computeCartSummary(cartItems);
  return { cartItems, ...meta };
}

export async function getCartMeta(userId) {
  const _id = new mongoose.Types.ObjectId(userId);
  const r = await User.aggregate([
    { $match: { _id } },
    { $unwind: { path: "$user_cart", preserveNullAndEmptyArrays: true } },
    { $match: { "user_cart.product_status": "Selected" } },
    {
      $group: {
        _id: null,
        count_items: { $sum: { $ifNull: ["$user_cart.product_qty", 0] } },
        count_lines: { $sum: 1 },
        subtotal: {
          $sum: {
            $multiply: [
              { $ifNull: ["$user_cart.product_price", 0] },
              { $ifNull: ["$user_cart.product_qty", 0] },
            ],
          },
        },
      },
    },
  ]);
  return {
    count_items: r?.[0]?.count_items ?? 0,
    count_lines: r?.[0]?.count_lines ?? 0,
    subtotal: r?.[0]?.subtotal ?? 0,
  };
}

// ดึง userId จาก auth (ถ้ามี) หรือ fallback (สำหรับ dev)
const resolveUserId = (req) => req.user?._id || "68c411b52e822abad46f8334";

/* ------------------------------ Controllers ------------------------------ */

// GET /cart
export const getCartByUser = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(resolveUserId(req));
    const { cartItems, count_items, count_lines, subtotal } =
      await readUserCart(userId);

    return res.status(200).json({
      error: false,
      cartItems,
      count_items,
      count_lines,
      subtotal,
      message: "Get cart successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// GET /cart/meta   → ใช้ sync badge/navbar ทีเดียว 2 ค่า
export const getCartMetaHandler = async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const meta = await getCartMeta(userId);
    // เพื่อรองรับโค้ดเดิมที่อ่าน field "count"
    return res.json({ error: false, count: meta.count_items, ...meta });
  } catch (e) {
    next(e);
  }
};

// GET /cart/count  → backward compatible (นับ “ชิ้นรวม”)
export const countCartByUser = async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const meta = await getCartMeta(userId);
    return res.json({ error: false, count: meta.count_items, ...meta });
  } catch (err) {
    next(err);
  }
};

export const addCartItem = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = resolveUserId(req);
    const _id = new mongoose.Types.ObjectId(userId);

    const {
      product_id,
      product_color,
      product_qty = 1,
      product_status,
    } = req.body;
    if (!product_id || !product_color) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: true, message: "Missing product_id or product_color" });
    }

    const pid = new mongoose.Types.ObjectId(product_id);
    const qty = Math.max(1, parseInt(product_qty, 10) || 1);

    const prod = await Product.findById(pid)
      .select("product_name product_image product_price product_color stock")
      .lean()
      .session(session);
    if (!prod) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ error: true, message: "Product not found" });
    }

    const incRes = await User.updateOne(
      {
        _id,
        "user_cart.product_id": pid,
        "user_cart.product_color": product_color,
      },
      {
        $inc: { "user_cart.$.product_qty": qty },
        $set: { "user_cart.$.product_status": product_status || "Selected" },
      },
      { session }
    );

    if (incRes.matchedCount === 0) {
      const newItem = {
        product_id: pid,
        product_status: product_status || "Selected",
        product_name: prod.product_name,
        product_image: prod.product_image,
        product_color,
        product_price: prod.product_price,
        product_qty: qty,
      };
      await User.updateOne(
        { _id },
        { $push: { user_cart: newItem } },
        { session }
      );
    }

    // ✅ commit ก่อน แล้วค่อยอ่าน meta (จะได้ค่าปัจจุบันแน่นอน)
    await session.commitTransaction();
    session.endSession();

    const meta = await getCartMeta(userId); // {count_items, count_lines, subtotal}
    return res.status(201).json({
      error: false,
      message: incRes.matchedCount ? "Increased quantity" : "Added to cart",
      ...meta,
      count: meta.count_items, // เผื่อ FE เก่า
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// PUT /cart/:itemId  (set absolute qty)
export const productQty = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(resolveUserId(req));
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

    const found = await User.findOne(
      { _id: userId, "user_cart._id": itemId },
      { "user_cart.$": 1 }
    ).lean();
    if (!found) {
      return res
        .status(404)
        .json({ error: true, message: "Cart item not found" });
    }

    const item = found.user_cart?.[0];
    if (item?.product_id) {
      const prodId = item.product_id._id || item.product_id;
      try {
        const prod = await Product.findById(prodId).select("stock").lean();
        if (prod?.stock != null && qty > prod.stock) {
          return res
            .status(400)
            .json({ error: true, message: `จำนวนเกิน Stock (${prod.stock})` });
        }
      } catch {}
    }

    const upd = await User.updateOne(
      { _id: userId, "user_cart._id": itemId },
      {
        $set: {
          "user_cart.$.product_qty": qty,
          "user_cart.$.product_status": "Selected",
        },
      }
    );
    if (upd.matchedCount === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Cart item not found" });
    }

    const meta = await getCartMeta(userId);
    return res.json({ error: false, message: "Quantity updated", ...meta });
  } catch (err) {
    next(err);
  }
};

// PATCH /cart/:itemId/increase?step=1
export const increaseCartItemQty = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(resolveUserId(req));
    const { itemId } = req.params;
    const step = Math.max(1, Number(req.query.step) || 1);

    if (!mongoose.isValidObjectId(itemId)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid cart item id" });
    }

    // optional: check stock
    const found = await User.findOne(
      { _id: userId, "user_cart._id": itemId },
      { "user_cart.$": 1 }
    ).lean();
    if (!found)
      return res
        .status(404)
        .json({ error: true, message: "Cart item not found" });

    const item = found.user_cart?.[0];
    if (item?.product_id) {
      const prodId = item.product_id._id || item.product_id;
      const prod = await Product.findById(prodId).select("stock").lean();
      if (prod?.stock != null && item.product_qty + step > prod.stock) {
        return res
          .status(400)
          .json({ error: true, message: `จำนวนเกิน Stock (${prod.stock})` });
      }
    }

    await User.updateOne(
      { _id: userId, "user_cart._id": itemId },
      {
        $inc: { "user_cart.$.product_qty": step },
        $set: { "user_cart.$.product_status": "Selected" },
      }
    );

    const meta = await getCartMeta(userId);
    return res.json({ error: false, message: "Increased", ...meta });
  } catch (err) {
    next(err);
  }
};

// PATCH /cart/:itemId/decrease?step=1
export const decreaseCartItemQty = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(resolveUserId(req));
    const { itemId } = req.params;
    const step = Math.max(1, Number(req.query.step) || 1);

    if (!mongoose.isValidObjectId(itemId)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid cart item id" });
    }

    // ลด แล้วไม่ให้ต่ำกว่า 1
    const doc = await User.findOne(
      { _id: userId, "user_cart._id": itemId },
      { "user_cart.$": 1 }
    ).lean();
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: "Cart item not found" });

    const cur = Number(doc.user_cart?.[0]?.product_qty || 1);
    const nextQty = Math.max(1, cur - step);

    await User.updateOne(
      { _id: userId, "user_cart._id": itemId },
      { $set: { "user_cart.$.product_qty": nextQty } }
    );

    const meta = await getCartMeta(userId);
    return res.json({ error: false, message: "Decreased", ...meta });
  } catch (err) {
    next(err);
  }
};

// DELETE /cart/:itemId
export const deleteCartById = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(resolveUserId(req));
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

    const { cartItems } = await readUserCart(userId);
    const meta = computeCartSummary(cartItems);

    return res.json({
      error: false,
      cartItems,
      ...meta, // {count_items, count_lines, subtotal}
      message: "Removed item",
    });
  } catch (err) {
    console.error("DELETE /cart/:itemId error", err);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
};

// DELETE /cart
export const deleteCart = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(resolveUserId(req));
    await User.updateOne({ _id: userId }, { $set: { user_cart: [] } });

    return res.json({
      error: false,
      message: "Cart cleared",
      count_items: 0,
      count_lines: 0,
      subtotal: 0,
      count: 0, // backward compat
    });
  } catch (e) {
    next(e);
  }
};
