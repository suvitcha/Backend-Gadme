import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    user_name: { type: String, require: true },
    user_lastname: { type: String, require: true },
    user_username: { type: String, default: "" },
    user_email: { type: String, require: true },
    user_password: { type: String, require: true },
    user_cfpassword: { type: String, require: true },
    user_role: { type: String, enum: ["User", "Admin"], default: "User" },
    user_cart: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        product_name: { type: String, require: true },
        product_image: { type: String, require: true },
        product_color: { type: String, require: true },
        product_price: { type: Number, require: true },
        product_qty: { type: Number, require: true },
        addedOn: { type: Date, default: new Date().getTime() },
      },
    ],
  },
  { timestamps: true }
);

//Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10); //after we hash for 10 times then put to bcrypt
  next();
});

export const User = model("User", UserSchema);
