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
    category,
    productname,
    description,
    brand,
    warrantyinfo,
    relatedproduct,
  } = req.body;

  const userId = req.user.user._id; // Logged-in user's MongoDB _id will lock with Admin's id only

  //Validate data before create
  if (!category || !productname) {
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
      category,
      productname,
      description,
      brand,
      warrantyinfo,
      relatedproduct,
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
  const { color, image, stock, price } = req.body;
  const userId = req.user.user._id; // Logged-in user's MongoDB _id will lock with Admin's id only
  const productId = req.product.product._id; // Product's MongoDB _id

  //Validate data before create a variance
  if (!stock || !price) {
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
      color,
      image,
      stock,
      price,
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
    category,
    productname,
    description,
    brand,
    modelname,
    warrantyinfo,
    relatedproduct,
    features,
  } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

  // try {
  //   const note = await Note.findOne({ _id: noteId, userId: user._id });

  //   if (!note) {
  //     return res.status(404).json({ error: true, message: "Note not found" });
  //   }

  //   if (title) note.title = title;
  //   if (content) note.content = content;
  //   if (tags) note.tags = tags;
  //   if (isPinned) note.isPinned = isPinned;

  //   await note.save();

  //   return res.json({
  //     error: false,
  //     note,
  //     message: "Note updated successfully",
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
