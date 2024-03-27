const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getProducts,
  getsingleProduct,
  updateproduct,
  deleteProduct,
  newProducts,
  createReview,

  getReviews,
  deleteReviews,
  getAdminProducts,
} = require("../controllers/productController");
const router = express.Router();
const {
  isAuthenticateUser,
  authorizeRoles,
} = require("../middlewares/authenticate");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "..", "uploads/Product"));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

router.route("/products").get(getProducts);

router.route("/product/:id").get(getsingleProduct);

router.route("/review").put(isAuthenticateUser, createReview);

//admin routes

router
  .route("/admin/product/new")
  .post(
    isAuthenticateUser,
    authorizeRoles("admin"),
    upload.array("images"),
    newProducts
  );

router
  .route("/admin/products")
  .get(isAuthenticateUser, authorizeRoles("admin"), getAdminProducts);
router
  .route("/admin/product/:id")
  .delete(isAuthenticateUser, authorizeRoles("admin"), deleteProduct);
router
  .route("/admin/product/:id")
  .put(
    isAuthenticateUser,
    authorizeRoles("admin"),
    upload.array("images"),
    updateproduct
  );
router
  .route("/admin/reviews")
  .get(isAuthenticateUser, authorizeRoles("admin"), getReviews);
router
  .route("/admin/review")
  .delete(isAuthenticateUser, authorizeRoles("admin"), deleteReviews);

module.exports = router;
