const express = require("express");
const contactUs = require("../controllers/ContactController");
const protectGuard = require("../middlewares/AuthMiddleware");
const router = express.Router();

router.post("/", protectGuard, contactUs);

module.exports = router;
