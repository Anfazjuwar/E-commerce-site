const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  changePassword,
  updateProfile,
  getAllUsers,
  getUser,
  updateuser,
  deletUser,
} = require("../controllers/authController");
const router = express.Router();
const {
  isAuthenticateUser,
  authorizeRoles,
} = require("../middlewares/authenticate");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "..", "uploads/user"));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/myprofile").get(isAuthenticateUser, getUserProfile);
router.route("/password/change").put(isAuthenticateUser, changePassword);
router
  .route("/update")
  .put(isAuthenticateUser, upload.single("avatar"), updateProfile);

//Admin routs
router
  .route("/admin/users")
  .get(isAuthenticateUser, authorizeRoles("admin"), getAllUsers);
router
  .route("/admin/users/:id")
  .get(isAuthenticateUser, authorizeRoles("admin"), getUser)
  .put(isAuthenticateUser, authorizeRoles("admin"), updateuser)
  .delete(isAuthenticateUser, authorizeRoles("admin"), deletUser);

module.exports = router;
