const express = require("express");
const {
  handlePayPalWebhook,
  createPayPalPayment,
  getAllPayments,
  deletePayment,
  createStripePaymentIntent,
  handleStripeWebhook,
  capturePayment
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/webhook", handlePayPalWebhook);
router.post("/create-paypal-payment", protect, createPayPalPayment);
router.post("/stripe/create-intent", protect, createStripePaymentIntent);
// Stripe webhook handled directly in server.js with raw parser
router.post("/capture-paypal", protect, capturePayment);
router.get("/", protect, getAllPayments);
router.delete("/:id", deletePayment);
module.exports = router;
