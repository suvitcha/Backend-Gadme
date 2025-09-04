import { model, Schema } from "mongoose";

const VarianceSchema = new Schema({
  color: { type: String, required: false },
  image: [{ type: String }], // เก็บ URL ของรูปสินค้า
  stock: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
});

const ItemScheme = new Schema(
  {
    category: { type: String, required: true },
    productname: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    brand: { type: String, required: false },
    modelname: { type: String, required: false },
    warrantyinfo: { type: String, required: false },
    relatedproduct: [{ type: String }], // ถ้าอยาก reference ไปที่ Item อื่น ใช้ ObjectId
    features: [{ type: String }],
    variances: [VarianceSchema], // array ของ objects (สี, รูป, stock, price)
  },
  { timestamps: true } //use this one because it's show a create time and edit time
);

export const Item = model("Item", ItemScheme);
