const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  getUser,
  loggedIn,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/UserController");
const protectGuard = require("../middlewares/AuthMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/loggedIn", loggedIn);
router.post("/forgotPwd", forgotPassword);
router.put("/resetPwd/:resetToken", resetPassword);
// only authorized users can access these routes
router.get("/getOne", protectGuard, getUser);
router.patch("/update", protectGuard, updateUser);
router.patch("/changePwd", protectGuard, changePassword);

module.exports = router;
