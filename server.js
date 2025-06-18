const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const authMiddleware = require("./middlewares/auth_middleware");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/user_dashboard.html", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user_dashboard.html"));
});

app.get("/admin_dashboard.html", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin_dashboard.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));