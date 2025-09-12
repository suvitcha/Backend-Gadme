import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    user_name: { type: String, required: true },
    user_lastname: { type: String, required: true },
    user_username: { type: String, default: "" },
    user_email: { type: String, required: true },
    user_password: { type: String, required: true },

    user_role: { type: String, enum: ["User", "Admin"], default: "User" },
    user_cart: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        product_status: {
          type: String,
          enum: ["Selected", "Checkout"],

          default: "Selected",
        },
        product_name: { type: String, required: true },
        product_image: { type: String, required: true },
        product_color: { type: String, required: true },
        product_price: { type: Number, required: true },
        product_qty: { type: Number, required: true },

        addedOn: { type: Date, default: new Date().getTime() },
      },
    ],
  },
  { timestamps: true }
);

//Hash password before saving to DB
UserSchema.pre("save", async function (next) {

  if (!this.isModified("user_password")) return next();
  this.user_password = await bcrypt.hash(this.user_password, 10);

  next();
});

export const User = model("User", UserSchema);
