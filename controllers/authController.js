const jwt = require("jsonwebtoken");
const User = require("../models/User");

const sendTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,        
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const user = await User.create({ name, email, password });

    sendTokenCookie(res, user._id);

    res.status(201).json({
      message: "Account created successfully.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.log(err)
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Server error. Please try again.", error:err.message,stack:err.stack });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    sendTokenCookie(res, user._id);

    res.json({
      message: "Logged in successfully.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully." });
};

// GET /api/auth/profile  (protected)
const getProfile = async (req, res) => {
  const user = req.user;
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      memberSince: user.createdAt,
    },
  });
};

module.exports = { register, login, logout, getProfile };
