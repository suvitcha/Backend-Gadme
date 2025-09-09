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
