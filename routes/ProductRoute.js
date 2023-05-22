const express = require("express");
const {
  createProduct,
  getProducts,
  getOneProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/ProductController");
const protectGuard = require("../middlewares/AuthMiddleware");
const router = express.Router();
const { upload } = require("../utils/FileUpload");

// crud uri
router.post("/create", protectGuard, upload.single("image"), createProduct);
router.get("/getAll", protectGuard, getProducts);
router.get("/getOne/:id", protectGuard, getOneProduct);
router.delete("/deleteOne/:id", protectGuard, deleteProduct);
router.patch("/update/:id", protectGuard, updateProduct);

module.exports = router;
