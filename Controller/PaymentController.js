const catchAsyncErrors = require("../Middleware/catchAsyncErrors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const processPayment = catchAsyncErrors(async (req, res) => {
  const { amount } = req.body;
  const myPayment = await stripe.paymentIntents.create({
    amount,
    currency: "inr",
    metadata: {
      company: "AyurBharat",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});

const sendStripeApiKey = catchAsyncErrors(async (req, res) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
});

module.exports = { processPayment, sendStripeApiKey };
