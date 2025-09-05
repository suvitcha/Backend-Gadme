import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, require: true },
    lastname: { type: String, require: true },
    username: { type: String, default: "" },
    email: { type: String, require: true },
    password: { type: String, require: true },
    cfpassword: { type: String, require: true },
  },
  { timestamps: true }
);

export const User = model("User", UserSchema);
