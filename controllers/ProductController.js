const asyncHandler = require("express-async-handler");
const Product = require("../models/ProductModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

/**
 * create a product
 */
const createProduct = asyncHandler(async (req, res) => {
  const { sku, name, description, category, brand, price, quantity } = req.body;

  // validate the request data
  if (!name || !description || !category || !brand || !price || !quantity) {
    res.status(400);
    throw new Error("Please fill out all the fields.");
  }

  // image upload
  let fileData = {};

  if (req.file) {
    // save photos to cloudinary saas
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Inventory Mgmt",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image uploading failed.");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.fileType,
      mimetype: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // creation
  const product = await Product.create({
    user: req.user.id,
    name,
    sku,
    category,
    brand,
    price,
    quantity,
    description,
    image: fileData,
  });

  res.status(201).json(product);
});

/**
 * retrieve all products
 */
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    user: req.user.id,
  }).sort("-createdAt"); // last product shows first

  res.status(200).json(products);
});

/**
 * retrieve a single product
 */
const getOneProduct = asyncHandler(async (req, res) => {
  const singleProduct = await Product.findById(req.params.id);

  // the product searched does not exist
  if (!singleProduct) {
    res.status(404);
    throw new Error("The product does not exist in the stock.");
  }

  // authorization check
  if (singleProduct.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not an authorized user.");
  }

  res.status(200).json(singleProduct);
});

/**
 * delete a product
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const singleProduct = await Product.findById(req.params.id);

  // the product searched does not exist
  if (!singleProduct) {
    res.status(404);
    throw new Error("The product does not exist in the stock.");
  }

  // authorization check
  if (singleProduct.user.toString() !== req.user.id) {
    res.status(401); // delete not allowed
    throw new Error("Not an authorized user.");
  }

  await singleProduct.remove();
  res.status(200).json({ message: "The product deleted successfully." });
});

/**
 * update one product
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, category, brand, price, quantity } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  // validate the request data
  if (!product) {
    res.status(404);
    throw new Error("Product not found in the database.");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not an authorized user.");
  }

  // image upload
  let fileData = {};

  if (req.file) {
    // save photos to cloudinary saas
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Inventory Mgmt",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image uploading failed.");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.fileType,
      mimetype: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // update procedure
  const updatedProduct = await Product.findByIdAndUpdate(
    {
      _id: id,
    },
    {
      name,
      category,
      brand,
      price,
      quantity,
      description,
      image: Object.keys(fileData).length === 0 ? product.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedProduct);
});

module.exports = {
  createProduct,
  getProducts,
  getOneProduct,
  deleteProduct,
  updateProduct,
};
