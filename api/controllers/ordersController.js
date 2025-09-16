// import mongoose from "mongoose";
// import { Order } from "../../models/Order.js";
// import { User } from "../../models/User.js";
// import { Product } from "../../models/Product.js";

// // ✅ ล็อก user ไว้เป็นค่าเดียว (DEV ONLY)
// const DEV_FIXED_USER_ID = new mongoose.Types.ObjectId(
//   "68c411b52e822abad46f8334"
// );

// // เดิม: อ่านจาก body/query -> เปลี่ยนให้คืนค่าเดียวเสมอ
// const getUserIdFromReqDev = (_req) => DEV_FIXED_USER_ID;

// export const createOrderFromCartDev = async (req, res) => {
//   const session = await mongoose.startSession();
//   try {
//     const userId = getUserIdFromReqDev(req);n dev
//     if (!userId)
//       return res
//         .status(400)
//         .json({ error: true, message: "Missing user_id (DEV)" });

//     const {
//       shippingAddress, // {...ตาม schema}
//       paymentMethod, // "credit_card" | "bank_transfer" | "cod"
//       shippingFee = 0,
//       discount = 0,
//     } = req.body;

//     // validate address คร่าว ๆ
//     const required = [
//       "address_firstname",
//       "address_lastname",
//       "address_phonenumber",
//       "address_subdistrict",
//       "address_district",
//       "address_province",
//       "address_postalcode",
//     ];
//     for (const k of required) {
//       if (!shippingAddress?.[k]) {
//         return res.status(400).json({ error: true, message: `Missing ${k}` });
//       }
//     }
//     if (!["credit_card", "bank_transfer", "cod"].includes(paymentMethod)) {
//       return res
//         .status(400)
//         .json({ error: true, message: "Invalid payment method" });
//     }

//     let saved;

//     await session.withTransaction(async () => {
//       // 1) โหลดตะกร้าของ user
//       const user = await User.findById(userId)
//         .select("user_cart")
//         .populate({
//           path: "user_cart.product_id",
//           model: "Product",
//           select:
//             "product_name product_image product_price product_color stock sku variant_id",
//         })
//         .session(session)
//         .lean();

//       const cart = (user?.user_cart || []).filter((it) => it.product_id);
//       if (!cart.length) throw new Error("Cart is empty");

//       // 2) ตรวจสต๊อก + snapshot
//       const order_items = cart.map((it) => {
//         const p = it.product_id;
//         const qty = Math.max(1, it.product_qty || 1);
//         const price = (it.product_price ?? p.product_price) || 0;

//         if ((p.stock ?? 0) < qty)
//           throw new Error(`Out of stock: ${p.product_name}`);

//         return {
//           product_id: p._id,
//           variant_id: p.variant_id,
//           product_sku: p.sku,
//           product_name: p.product_name,
//           product_image: p.product_image,
//           product_color: p.product_color,
//           product_qty: qty,
//           product_price: price,
//           product_subtotal: price * qty, // จะถูก hook คำนวณซ้ำให้ถูกต้อง
//         };
//       });

//       // 3) สร้างออเดอร์ (hook จะคำนวณ subtotal/total + gen order_number)
//       const order = new Order({
//         user_id: userId,
//         order_items,
//         order_shipping_address: shippingAddress,
//         order_payment: { method: paymentMethod, status: "pending" },
//         order_shippingFee: Math.max(0, shippingFee),
//         order_discount: Math.max(0, discount),
//       });
//       saved = await order.save({ session });

//       // 4) ตัดสต๊อก
//       for (const it of order_items) {
//         await Product.updateOne(
//           { _id: it.product_id },
//           { $inc: { stock: -it.product_qty } },
//           { session }
//         );
//       }

//       // 5) เคลียร์ตะกร้า
//       await User.updateOne(
//         { _id: userId },
//         { $set: { user_cart: [] } },
//         { session }
//       );
//     });

//     res.status(201).json({ error: false, order: saved });
//   } catch (e) {
//     res.status(400).json({ error: true, message: e.message });
//   } finally {
//     session.endSession();
//   }
// };

// export const getOrderByIdDev = async (req, res) => {
//   try {
//     // DEV: ยังไม่เช็กว่าเป็นของ user คนนี้ ใส่ทีหลังตอนมี auth
//     const order = await Order.findById(req.params.id);
//     if (!order)
//       return res.status(404).json({ error: true, message: "Order not found" });
//     res.json({ error: false, order });
//   } catch (e) {
//     res.status(500).json({ error: true, message: e.message });
//   }
// };
