const express = require("express");
const {
  newOrder,
  getOrderById,
  myorders,
  orders,
  updateOrders,
  deleteOrder,
} = require("../controllers/orderController");
const {
  isAuthenticateUser,
  authorizeRoles,
} = require("../middlewares/authenticate");
const router = express.Router();

router.route("/order/new").post(isAuthenticateUser, newOrder);
router.route("/order/:id").get(isAuthenticateUser, getOrderById);
router.route("/myorders").get(isAuthenticateUser, myorders);

//admin route
router
  .route("/admin/orders")
  .get(isAuthenticateUser, authorizeRoles("admin"), orders);
router
  .route("/admin/orders/:id")
  .put(isAuthenticateUser, authorizeRoles("admin"), updateOrders);
router
  .route("/delete/order/:id")
  .delete(isAuthenticateUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
