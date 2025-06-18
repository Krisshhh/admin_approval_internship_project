const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");

const router = express.Router();
const SECRET_KEY = "your_secret_key";

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      status: "pending",     // Set default status
      role: "user"           // Set default role
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful. Await admin approval." });
  } catch (err) {
    res.status(400).json({ message: "Invalid data or server error." });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("Found user:", user); //debugging line
    
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status !== "approved") {
      return res.status(403).json({ message: "Not approved", status: user.status, role: user.role });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      "your_secret_key"
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict"
    });

    console.log("Sending response with role:", user.role);

    res.json({
      message: "Login successful",
      role: user.role,
      status: user.status
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Current logged in user
router.get("/me", require("../middlewares/auth_middleware"), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user details" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/index.html");
});

module.exports = router;
