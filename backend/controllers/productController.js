const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncErr");
const APIFeatures = require("../utils/apiFeatures");

// get all products = /api/v1/products
exports.getProducts = catchAsyncError(async (req, res, next) => {
  const resPage = 3;
  //two parameters for api fetures constructor(query, queryStr)

  let bulidQuery = () => {
    return new APIFeatures(Product.find(), req.query).search().filter();
  };

  const filteredProductCount = await bulidQuery().query.countDocuments({});
  const totalproductsCount = await Product.countDocuments({}); //geting all products
  let productscount = totalproductsCount;

  if (filteredProductCount !== totalproductsCount) {
    productscount = await filteredProductCount;
  }

  const products = await bulidQuery().paginate(resPage).query;

  res.status(200).json({
    success: true,
    message: "This route will show all the products in datbase",

    products,
    count: productscount,
    resPage,
  });
});

//create Produt =/api/v1//products/new
exports.newProducts = catchAsyncError(async (req, res, next) => {
  let images = [];
  let BASE_URL = process.env.BACKEND_URL;
  if (process.env.NODE_ENV === "production") {
    BASE_URL = `${req.protocol}://${req.get("host")}`;
  }
  if (req.files.length > 0) {
    req.files.forEach((file) => {
      let url = `${BASE_URL}/uploads/Product/${file.originalname}`;
      images.push({ image: url });
    });
  }
  req.body.images = images;
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//get single product api/v1/product/id:

exports.getsingleProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate(
    "reviews.user",
    "name email"
  );

  if (!product) {
    return next(new ErrorHandler("Product not found", 400));
  }

  res.status(201).json({
    success: true,
    product,
  });
});

// update product api/v1/product/id:

exports.updateproduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  //uploadingimages
  let images = [];

  //if images not clear we keeping existing product
  if (req.body.imagesCleared === false) {
    images = product.images;
  }
  let BASE_URL = process.env.BACKEND_URL;
  if (process.env.NODE_ENV === "production") {
    BASE_URL = `${req.protocol}://${req.get("host")}`;
  }
  if (req.files.length > 0) {
    req.files.forEach((file) => {
      let url = `${BASE_URL}/uploads/Product/${file.originalname}`;
      images.push({ image: url });
    });
  }
  req.body.images = images;

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product  not found",
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product  not found",
    });
  }
  await product.deleteOne(); // Use deleteOne() to delete the document

  res.status(200).json({
    success: true,
    message: "product was deleted",
  });
});

//create Review - api/v1/review

exports.createReview = catchAsyncError(async (req, res, next) => {
  const { productId, rating, Comment } = req.body;

  const review = {
    user: req.user.id,
    rating,
    Comment,
  };
  const product = await Product.findById(productId);

  //finiding already has rewied
  const isReviewed = product.reviews.find((review) => {
    return review.user.toString() == req.user.id.toString();
  });

  if (isReviewed) {
    //updating rewiew
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user.id.toString()) {
        review.Comment = Comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  //acc means intial valu = 0 or old value addig
  //find avearge of products rewvie
  product.ratings =
    product.reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / product.reviews.length;
  product.ratings = isNaN(product.ratings) ? 0 : product.ratings;

  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

//getRewies - api/v1/reviews

exports.getReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id).populate(
    "reviews.user",
    "name email"
  );
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//delete Review - api/v1/review

exports.deleteReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  //match deleteing
  const reviews = product.reviews.filter((review) => {
    return review._id.toString() !== req.query.id.toString();
  });

  //upadting no reviws
  const numOfReviews = reviews.length;

  //finding average fillterd revies
  let ratings =
    product.reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / product.reviews.length;

  ratings = isNaN(ratings) ? 0 : ratings;

  //saving product

  await Product.findByIdAndUpdate(req.query.productId, {
    reviews,
    numOfReviews,
    ratings,
  });

  res.status(200).json({
    success: true,
    message: "rewiew was deleted",
  });
});

//admin products - api/v1/admin/products

exports.getAdminProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).send({
    success: true,
    products,
  });
});
