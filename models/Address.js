import { Schema, model } from "mongoose";

const AddressScheme = new Schema(
  {
    userId: { type: String, require: true },
    firstname: { type: String, require: true },
    lastname: { type: String, require: true },
    phonenumber: { type: String, require: true },
    roomnumber: { type: String, default: "" },
    floor: { type: String, default: "" },
    buildingname: { type: String, default: "" },
    housenumber: { type: String, default: "" },
    villagenumber: { type: String, default: "" },
    villagename: { type: String, default: "" },
    alley: { type: String, default: "" },
    road: { type: String, require: true },
    subdistrict: { type: String, require: true },
    district: { type: String, require: true },
    province: { type: String, require: true },
    postalcode: { type: String, require: true },
  },
  { timestamps: true }
);

export const Address = model("🏡Address", AddressScheme);
