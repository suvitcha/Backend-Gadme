import { model, Schema } from "mongoose";

const ItemScheme = new Schema(
  {
    productname: { type: String, required: true },
    description: { type: String, default: "" },
    price: {type: Number, default: 0, required: true},
    image: {type: String, default:""},
    color: {type:[String, Number], default: ["white",0]},
    stock: {type: Number, default:0, required: true},
    brand: {type: String, default:""},
    features: {type: [String], default: []},
    modelname: {type: String, default:""},
    warrantyinfo: {type: [String, Number], default: ["",0]},,
    relatedproduct:{type: [String], default: []}, //to show other items that user might interest
  },
  { timestamps: true } //use this one because it's show a create time and edit time
);

export const Item = model("Item", ItemScheme);