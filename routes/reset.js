const express = require("express");
const crypto = require("crypto");
const User = require("../models/user_model");
const ResetToken = require("../models/reset_token_model");
const sendStatusEmail = require("../utils/mailer");
const bcrypt = require("bcrypt");
const path = require("path");

const router = express.Router();

router.post("/request-reset", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");

  await ResetToken.deleteMany({ userId: user._id }); //removes previous tokens
  await new ResetToken({ userId: user._id, token }).save();

  const resetLink = `http://localhost:3000/reset_pwd.html?token=${token}&id=${user._id}`;
  await sendStatusEmail(user.email, "Password Reset", `Click to reset: ${resetLink}`);

  res.json({ message: "Reset link sent to your email" });
});

router.post("/reset-password", async (req, res) => {
  const { id, token, password } = req.body;

  const resetToken = await ResetToken.findOne({ userId: id, token });
  if (!resetToken) return res.status(400).json({ message: "Invalid or expired token" });

  const hashedPwd = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(id, { password: hashedPwd });
  await ResetToken.deleteMany({ userId: id });

  res.json({ message: "Password successfully reset" });
});

module.exports = router;