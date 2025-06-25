const express = require("express");
const User = require("../models/user_model");
const authMiddleware = require("../middlewares/auth_middleware");

const router = express.Router();

router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    const grouped = {
      pending: [],
      approved: [],
      rejected: [],
    };
    users.forEach(user => {
      if (grouped[user.status]) grouped[user.status].push(user);
    });
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.post("/approve/:id", authMiddleware, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "User approved" });
});

router.post("/reject/:id", authMiddleware, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.json({ message: "User rejected" });
});
module.exports = router;