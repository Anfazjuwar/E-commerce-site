const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true, //without space
    maxLength: [100, "Product name cannot exceed 100 characters"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    // default:0.0 if like youn can give
  },
  description: {
    type: String,
    required: [true, "Please enter the product description"],
  },
  ratings: {
    type: String,
    default: 0,
  },
  images: [
    {
      image: {
        type: String,
        required: [true],
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please enter product categories"],
    enum: {
      values: [
        "Electronics",
        "Mobile Phones",
        "Laptops",
        "Accessories",
        "Headphones",
        "Food",
        "Books",
        "Clothes/Shoes",
        "Beauty/Health",
        "Sports",
        "Outdoor",
        "Home",
      ],
      message: "Please select correct category",
    },
  },
  seller: {
    type: String,
    required: [true, "Please enter product stock"],
  },
  stock: {
    type: Number,
    required: [true, "Stock field can not be empty"],
    maxLength: [20, "Product stock cannot be  exceed"],
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rating: {
        type: String,
        required: true,
      },
      Comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

let Schema = mongoose.model("Product", productSchema);

module.exports = Schema;
