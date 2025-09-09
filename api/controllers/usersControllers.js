import { User } from "../../models/User";

export const getAllUsers = async (req, res) => {
  try {
    // exclude passwords in the result
    const users = await User.find().select("-password").sort("-createdAt");
    res.json({ error: false, users });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch users",
      details: err.message,
    });
  }
};

export const createUser = async (req, res) => {
  const { user_name, user_lastname, user_email, user_password } = req.body;

  if (!user_name || !user_lastname) {
    return res
      .status(400)
      .json({ error: true, message: "Name and lastname are required" });
  }

  if (!user_email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  try {
    // prevent duplicates
    const existing = await User.findOne({ user_email });
    if (existing) {
      return res
        .status(409)
        .json({ error: true, message: "Email already in use" });
    }

    // create & save
    const user = new User({ user_name, user_email });
    await user.save();

    return res
      .status(201)
      .json({ error: false, user, message: "User created successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
};
