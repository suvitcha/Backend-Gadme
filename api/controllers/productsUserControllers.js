import { Product } from "../../models/Product.js";

export const getAllProductsByName = async (req, res, next) => {
  const { product_name } = req.body;
  try {
    const products = await Product.find({
      product_name: product_name,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      error: false,
      products: products,
      message: "All user's products retrieved sucessfully!",
    });
  } catch (err) {
    next(err);
  }
};
