import { Schema, model } from "mongoose";

const AddressScheme = new Schema(
  {
    user_address: [
      {
        address_firstname: { type: String, require: true },
        address_lastname: { type: String, require: true },
        address_phonenumber: { type: String, require: true },
        address_address: { type: String, require: true },
        address_subdistrict: { type: String, require: true },
        address_district: { type: String, require: true },
        address_province: { type: String, require: true },
        address_postalcode: { type: String, require: true },
      },
    ],
  },
  { timestamps: true }
);

export const Address = model("🏙️Address", AddressScheme);
