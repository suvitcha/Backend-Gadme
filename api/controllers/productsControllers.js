import { Product } from "../../models/Product";
import { Variance } from "../../models/Variance";

export const getAllProducts = async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1, isPinned: -1 });
    return res.json({
      error: false,
      products,
      message: "All products retrieved successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Failed to fetch all products",
      details: err.message,
    });
  }
};

//createProduct
export const createProduct = async (req, res, next) => {
  const {
    product_category,
    product_name,
    product_description,
    product_brand,
    product_warrantyinfo,
    product_relatedproduct,
  } = req.body;

  const userId = req.user.user._id; // Logged-in user's MongoDB _id will lock with Admin's id only

  //Validate data before create
  if (!product_category || !product_name) {
    const error = new Error(
      "Required field still empty. Please fill the required field before try again"
    );
    error.status = 400;
    return next(error);
  }

  //Validate userId before allow to create
  if (!userId) {
    return res
      .status(401)
      .json({ error: true, message: "Unauthorized - no user ID found" });
  }

  try {
    const product = await Product.create({
      product_category,
      product_name,
      product_description,
      product_brand,
      product_warrantyinfo,
      product_relatedproduct,
      userId, //recorded a userId of who create the product
    });

    return res.status(201).json({
      error: false,
      product: product,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

//createVariance
export const createVariance = async (req, res, next) => {
  const { variance_color, variance_optional, variance_stock, variance_price } = req.body;
  const userId = req.user.user._id; // Logged-in user's MongoDB _id will lock with Admin's id only
  const productId = req.product.product._id; // Product's MongoDB _id

  //Validate data before create a variance
  if ( !variance_stock || !variance_price ) {
    const error = new Error(
      "Required field still empty. Please fill the required field before try again"
    );
    error.status = 400;
    return next(error);
  }

  //Validate userId before allow to create
  if (!userId) {
    return res
      .status(401)
      .json({ error: true, message: "Unauthorized - no user ID found" });
  }
  //Validate productId before allow to create
  if (!productId) {
    return res
      .status(401)
      .json({ error: true, message: "Unauthorized - no product ID found" });
  }

  try {
    const variance = await Variance.create({
variance_color, variance_optional, variance_stock, variance_price ,
      userId, //recorded a userId of who create the product
    });

    return res.status(201).json({
      error: false,
      product: product,
      message: "Variance created successfully",
    });
  } catch (error) {
    console.error("Error creating variance:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

//editProduct
export const editProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const {
    product_category,
    product_name,
    product_description,
    product_brand,
    product_modelname,
    product_warrantyinfo,
    product_relatedproduct,
    product_features,
  } = req.body;
  const { user } = req.user;

  if (!product_category && !product_name ) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

   try {
     const product = await Product.findOne({ _id: productId, userId: user._id }); //the userId is need because it's Admin only that able to edit

    if (!product) {
      return res.status(404).json({ error: true, message: "Product not found" });
    }

    if (product_category) product.product_category = product_category;
    if (product_name) product.product_name = product_name;
    if (product_description) product.product_description = product_description;
    if (product_brand) product.product_brand = product_brand;
    if (product_modelname) product.product_modelname = product_modelname;
    if (product_warrantyinfo) product.product_warrantyinfo = product_warrantyinfo;
    if (product_relatedproduct) product.product_relatedproduct = product_relatedproduct;
    if (product_features) product.product_features = product_features;

    await product.save();

    return res.json({
      error: false,
     product,
      message: "Product updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

//editVariance
export const editVariance = async (req, res, next) => {
  // const productId = req.params.productId;
  // const {
  //   product_category,
  //   product_name,
  //   product_description,
  //   product_brand,
  //   product_modelname,
  //   product_warrantyinfo,
  //   product_relatedproduct,
  //   product_features,
  // } = req.body;
  // const { user } = req.user;

  // if (!product_category && !product_name ) {
  //   return res
  //     .status(400)
  //     .json({ error: true, message: "No changes provided" });
  // }

  //  try {
  //    const product = await Product.findOne({ _id: productId, userId: user._id }); //the userId is need because it's Admin only that able to edit

  //   if (!product) {
  //     return res.status(404).json({ error: true, message: "Product not found" });
  //   }

  //   if (product_category) product.product_category = product_category;
  //   if (product_name) product.product_name = product_name;
  //   if (product_description) product.product_description = product_description;
  //   if (product_brand) product.product_brand = product_brand;
  //   if (product_modelname) product.product_modelname = product_modelname;
  //   if (product_warrantyinfo) product.product_warrantyinfo = product_warrantyinfo;
  //   if (product_relatedproduct) product.product_relatedproduct = product_relatedproduct;
  //   if (product_features) product.product_features = product_features;

  //   await product.save();

  //   return res.json({
  //     error: false,
  //    product,
  //     message: "Product updated successfully",
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     error: true,
  //     message: "Internal Server Error",
  //   });
  // }
};

  // //deleteNote
  // export const deleteNote = async (req, res, next) => {
  //   const noteId = req.params.id;

  //   try {
  //     const note = await Note.findOne({ _id: noteId });

  //     if (!note) {
  //       const error = new Error("Note not found😥");
  //       error.status = 404;
  //       return next(error);
  //     }

  //     await Note.deleteOne({ _id: noteId });
  //     res.status(200).json({
  //       error: false,
  //       message: "Note delete successfully!🍁",
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };
};
