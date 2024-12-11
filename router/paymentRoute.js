const express = require("express");
const router = express.Router();
const payment = require("../Controller/PaymentController");
const { restrict, isAuthenticatedUser } = require("../Middleware/auth");

router.post("/payment/process", isAuthenticatedUser, payment.processPayment);
router.get("/stripeapikey", isAuthenticatedUser, payment.sendStripeApiKey);

module.exports = router;
