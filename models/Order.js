import { Schema, model } from "mongoose";

const OrderScheme = new Schema(
    {
        userId: { type: String, require: true },
        // cartId: { type: String, require: true },
        items:{ type: [
            {String}
        ], default:[]}
    },
    { timestamps: true }
)

export const Order = model("🛒Order",OrderScheme)