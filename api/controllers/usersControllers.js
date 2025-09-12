import { User } from "../../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-user_password")
      .sort({ "-createdAt": -1 });
    res.json({ error: false, users });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch users",
    });
  }
};

export const createUser = async (req, res) => {
  const { user_name, user_lastname, user_username, user_email, user_password } =
    req.body;

  if (!user_name) {
    return res.status(400).json({ error: true, message: "Name is required" });
  }

  if (!user_lastname) {
    return res
      .status(400)
      .json({ error: true, message: "Lastname is required" });
  }

  if (!user_username) {
    return res
      .status(400)
      .json({ error: true, message: "Username is required" });
  }

  if (!user_email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!user_password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  try {
    // prevent duplicates email
    const existing = await User.findOne({ user_email });
    if (existing) {
      return res
        .status(409)
        .json({ error: true, message: "Email is already in use" });
    }

    // create & save user
    const user = new User({
      user_name,
      user_lastname,
      user_username,
      user_email,
      user_password,
    });
    await user.save();

    return res
      .status(201)
      .json({ error: false, user, message: "User created successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "server error", details: err.message });
  }
};

//signup a new user
export const signupUser = async (req, res) => {
  const { user_name, user_lastname, user_username, user_email, user_password } =
    req.body;

  if (
    !user_name ||
    !user_lastname ||
    !user_username ||
    !user_email ||
    !user_password
  ) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ user_email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: true, message: "Email already in use" });
    }

    const user = new User({
      user_name,
      user_lastname,
      user_username,
      user_email,
      user_password,
    });
    await user.save();
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "server error",
      details: err.message,
    });
  }
};
