const express = require("express");
const User = require("../models/user_model");
const authMiddleware = require("../middlewares/auth_middleware");

const router = express.Router();

// List all pending users
router.get("/pending", authMiddleware, async (req, res) => {
  const users = await User.find({ status: "pending" });
  res.json(users);
});

// Approve user
router.post("/approve/:id", authMiddleware, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "User approved" });
});

module.exports = router;