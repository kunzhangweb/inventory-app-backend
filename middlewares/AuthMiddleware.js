const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");

const protectGuard = asyncHandler(async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      res.status(401);
      throw new Error("Action not authorized. Please login first.");
    }
    console.log(token);
    // token verification
    const JWT_SECRET = process.env.JWT_SECRET;
    const verified = jwt.verify(token, JWT_SECRET);

    // retrieve a specific user using the token
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found.");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Action not authorized. Please login first.");
  }
});

module.exports = protectGuard;
