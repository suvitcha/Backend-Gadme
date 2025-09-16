import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../models/User.js";
import {
  createUser,
  getAllUsers,
  signupUser,
} from "../controllers/usersControllers.js";
import { authUser } from "../../middleware/auth.js";

const router = express.Router();

//Get all users
router.get("/users", getAllUsers);
//Post a user
router.post("/users", createUser);

//signup a new user
router.post("/auth/signup", signupUser);

//login a user - jwt signed token
router.post("/auth/login", async (req, res) => {
  const { user_email, user_password } = req.body;

  if (!user_email || !user_password) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ user_email });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.user_role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ error: false, token, message: "Login successful" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "server error", details: err.message });
  }
});

//Login a user - jwt signed token
router.post("/auth/cookie/login", async (req, res) => {
  console.log(">>> HIT /auth/cookie/login - body:", req.body);
  const { user_email, user_password } = req.body;

  if (!user_email || !user_password) {
    console.log("Missing email/password", req.body);
    return res
      .status(400)
      .json({ error: true, message: "Email and Password are required" });
  }

  try {
    const user = await User.findOne({ user_email });
    console.log("Found user:", !!user, user?._id);
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.user_role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in production
      sameSite: isProd ? "none" : "lax", // adjust based on your client-server setup
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      error: false,
      message: "Login successful",
      user: {
        _id: user._id,
        user_name: user.user_name,
        user_lastname: user.user_lastname,
        user_email: user.user_email,
        user_username: user.user_username,
        user_role: user.user_role,
      }, // send some safe public user info if needed
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// GET Current User Profile (protected route)
router.get("/auth/profile", authUser, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-user_password");
  if (!user) {
    return res.status(404).json({ error: true, message: "User not found" });
  }

  res.status(200).json({ error: false, user });
});

//Logout user - clear cookie
router.post("/auth/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// Verify JWT token
router.get("/auth/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: true, message: "Token is required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      error: false,
      userId: decoded.userId,
      role: decoded.role,
      message: "Token is valid",
    });
  } catch (err) {
    return res.status(401).json({ error: true, message: "Invalid token" });
  }
});

// ❌ Use after implementing auth
// Create User account
router.post("/create-account", async (req, res) => {
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

  const isUser = await User.findOne({ email: user_email });

  if (isUser) {
    return res.json({ error: true, message: "User already exist" });
  }

  const user = new User({
    user_name,
    user_email,
    user_password,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration successful",
  });
});

//Get User
router.get("/get-user", async (req, res) => {
  const { user } = req.user;

  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.json({ user: isUser, message: "" });
});

router.get("/auth/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.user });
});

export default router;
