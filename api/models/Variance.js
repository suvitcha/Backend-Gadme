import { model, Schema } from "mongoose";

const VarianceSchema = new Schema(
  {
    color: { type: String, required: false },
    image: [{ type: String }], // เก็บ URL ของรูปสินค้า
    stock: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Variance = model("Variance", VarianceSchema);
