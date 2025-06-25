const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");

const router = express.Router();
const SECRET_KEY = "your_secret_key";

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
    });
  }

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
      status: "pending",
      role: "user"
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful. Await admin approval." });
  } catch (err) {
    res.status(400).json({ message: "Invalid data or server error." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your request was rejected. Contact admin.", status: user.status, role: user.role });
    }

    if (user.status === "pending") {
      return res.status(403).json({ message: "Your account is still pending approval.", status: user.status, role: user.role });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      "your_secret_key"
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict"
    });

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

router.get("/me", require("../middlewares/auth_middleware"), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user details" });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Strict",
    secure: false
  });
  res.redirect("/login.html");
});

router.get("/check-email", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ available: false, message: "Email required" });

  const user = await User.findOne({ email });
  if (user) {
    return res.json({ available: false, message: "Email already registered" });
  }
  return res.json({ available: true, message: "Email is available" });
});

module.exports = router;