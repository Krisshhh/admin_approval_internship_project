const express = require("express");
const User = require("../models/user_model");
const authMiddleware = require("../middlewares/auth_middleware");
const sendStatusEmail = require("../utils/mailer");

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
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (user) {
      await sendStatusEmail(
        user.email,
        "Account Approved",
        `Hi ${user.name}, your signup request has been approved. You can now log in to your account.`
      );
    }
    res.json({ message: "User approved" });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Error approving user" });
  }
});

router.post("/reject/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (user) {
      await sendStatusEmail(
        user.email,
        "Account Rejected",
        `Hi ${user.name}, your signup request has been rejected. Please contact the administrator for more details.`
      );
    }
    res.json({ message: "User rejected" });
  } catch (err) {
    console.error("Rejection error:", err);
    res.status(500).json({ message: "Error rejecting user" });
  }
});

module.exports = router;