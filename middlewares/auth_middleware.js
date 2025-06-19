const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login.html");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.redirect("/login.html");
  }
};