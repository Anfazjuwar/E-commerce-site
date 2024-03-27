const products = require("../data/product.json");
const Product = require("../models/productModel");
const path = require("path");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");

dotenv.config({ path: "backend/config/.env" });

connectDatabase();

const seedProducts = async () => {
  try {
    await Product.deleteMany({}, { timeout: false });

    console.log("Products deleted!");
    await Product.insertMany(products);
    console.log("All products added!");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

seedProducts();
