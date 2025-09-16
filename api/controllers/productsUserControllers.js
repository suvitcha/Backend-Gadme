import { Product } from "../../models/Product.js";

export const getProductsByName = async (req, res, next) => {
  const { product_name } = req.params;
  try {
    const products = await Product.find({ product_name }).sort({
      product_price: 1,
      _id: 1,
    });

    res.status(200).json({
      error: false,
      products: products,
      message: "Get product sucessfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.aggregate([
      { $sort: { product_name: 1, product_price: 1, _id: 1 } },
      {
        $group: {
          _id: "$product_name",
          id: { $first: "$_id" },
          product_image: { $first: "$product_image" }, // รูปของตัวถูกสุด
          minPrice: { $first: "$product_price" },
          product_brand: { $first: "$product_brand" },
          product_category: { $first: "$product_category" },
          product_tag: { $first: "$product_tag" },
        },
      },
      { $sort: { minPrice: 1, _id: 1 } },
    ]);

    res.status(200).json({
      error: false,
      products: products,
      message: "All products sucessfully!",
    });
  } catch (err) {
    next(err);
  }
};
