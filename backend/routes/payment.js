const {
  processPayment,

  sendStripeApi,
} = require("../controllers/payemntControler");
const { isAuthenticateUser } = require("../middlewares/authenticate");

const express = require("express");
const router = express.Router();

router.route("/payment/process").post(isAuthenticateUser, processPayment);
router.route("/stripeapi").get(isAuthenticateUser, sendStripeApi);

module.exports = router;
