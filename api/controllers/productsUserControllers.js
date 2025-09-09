import { Product } from "../../models/Product.js";

export const getProductsByName = async (req, res, next) => {
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
      message: "Get product sucessfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.aggregate([
      {
        $group: {
          _id: "$product_name",
          product_brand: { $first: "$product_brand" },
          product_category: { $first: "$product_category" },
          product_tag: { $first: "$product_tag" },
          product_image: { $first: "$product_image" },
          minPrice: { $min: "$product_price" },
        },
      },
      { $sort: { _id: 1 } },
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
