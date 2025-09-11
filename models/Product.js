import { model, Schema } from "mongoose";

const ProductScheme = new Schema(
  {
    product_name: { type: String, required: true, trim: true },
    product_brand: { type: String, required: false },
    product_category: { type: String, required: true, trim: true },
    product_image: { type: String, required: false },
    product_color: { type: String, required: false },
    product_price: { type: Number, default: 0, required: true },
    product_stock: { type: Number, default: 0, required: true },
    product_description: { type: String, required: false },
    product_tag: [{ type: String, required: false }],
  },
  { timestamps: true } //use this one because it's show a create time and edit time
);

export const Product = model("Product", ProductScheme);
