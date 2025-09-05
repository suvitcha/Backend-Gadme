import { model, Schema } from "mongoose";

const VarianceSchema = new Schema(
  {
    productId: { type: String, required: true }, //receive a productId from database
    color: { type: String, required: false },
    image: [{ type: String }], // เก็บ URL ของรูปสินค้า
    stock: { type: Number, default: 0, required: true },
    price: { type: Number, default: 0, required: true },
  },
  { timestamps: true }
);

export const Variance = model("Variance", VarianceSchema);
