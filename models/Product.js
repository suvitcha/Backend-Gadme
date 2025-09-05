import { model, Schema } from "mongoose";

const ProductScheme = new Schema(
  {
    category: { type: String, required: true },
    productname: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    brand: { type: String, required: false },
    modelname: { type: String, required: false },
    warrantyinfo: { type: String, required: false },
    relatedproduct: [{ type: String, required: false }], // ถ้าอยาก reference ไปที่ Item อื่น ใช้ ObjectId
    features: [{ type: String, required: false }],
  },
  { timestamps: true } //use this one because it's show a create time and edit time
);

export const Product = model("Product", ProductScheme);
