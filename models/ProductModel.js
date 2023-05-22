const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "SKU",
    },
    name: {
      type: String,
      required: [true, "Please enter a name"],
      unique: true,
    },

    category: {
      type: String,
      required: [true, "Please enter a category"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Please enter a brand"],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Please enter a price"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Please enter a number"],
      trim: true,
    },
    description: { type: String, required: true },
    image: { type: Object, default: {} },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
