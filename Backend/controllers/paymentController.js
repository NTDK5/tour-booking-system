const paypal = require("@paypal/checkout-server-sdk");
const { client } = require("../utils/paypalClient");
const Booking = require("../models/bookingModel");
const asyncHandler = require("express-async-handler");
const Tour = require("../models/tourModel");
const Payment = require("../models/paymentModel");
const Lodge = require("../models/lodgeModel");
const Car = require("../models/carModel");
// Removed Chapa's axios usage
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// @desc Get all payments
// @route GET /api/payments
// @access Private (Admin)
const getAllPayments = asyncHandler(async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "booking",
        populate: { path: "user", select: "first_name last_name email" }
      });

    if (!payments.length) {
      return res.status(404).json({ message: "No payments found" });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error.message);
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
});

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the payment
    const deletedPayment = await Payment.findByIdAndDelete(id);

    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// @desc Create PayPal payment
// @route POST /api/payments/create
// @access Private
const createPayPalPayment = asyncHandler(async (req, res) => {
  const { bookingType, tourId, lodgeId, carId, roomId, totalAmount, bookingId } = req.body;

  if (!totalAmount || isNaN(totalAmount)) {
    res.status(400);
    throw new Error("Invalid total amount");
  }

  let itemDescription;
  let customId;

  switch (bookingType.toLowerCase()) {
    case "tour":
      const tour = await Tour.findById(tourId);
      if (!tour) {
        res.status(404);
        throw new Error("Tour not found");
      }
      itemDescription = `Tour Booking: ${tour.title}`;
      customId = JSON.stringify({ tourId, bookingId });
      break;

    case "lodge":
      const lodge = await Lodge.findOne({ "roomTypes._id": roomId });
      if (!lodge) {
        res.status(404);
        throw new Error("Lodge not found");
      }
      const room = lodge.roomTypes.id(roomId);
      itemDescription = `Room Booking: ${room.type} at ${lodge.name}`;
      customId = JSON.stringify({ lodgeId, roomId, bookingId });
      break;

    case "car":
      const car = await Car.findById(carId);
      if (!car) {
        res.status(404);
        throw new Error("Car not found");
      }
      itemDescription = `Car Rental: ${car.brand} ${car.model}`;
      customId = JSON.stringify({ carId, bookingId });
      break;

    default:
      res.status(400);
      throw new Error("Invalid booking type");
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: totalAmount.toString(),
        },
        description: itemDescription,
        custom_id: customId,
      },
    ],
    application_context: {
      brand_name: "Dorze Tours",
      landing_page: "LOGIN",
      user_action: "PAY_NOW",
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
    }
  });

  try {
    const order = await client().execute(request);

    // Get the approval URL from the links array
    const approvalUrl = order.result.links.find(link => link.rel === "approve")?.href;

    if (!approvalUrl) {
      throw new Error("PayPal approval URL not found");
    }

    res.json({
      orderID: order.result.id,
      approvalUrl
    });
  } catch (err) {
    console.error("PayPal order creation error:", err);
    res.status(500);
    throw new Error("Error creating PayPal order");
  }
});

// @desc Handle PayPal webhook events
// @route POST /api/payments/webhook
// @access Public
const handlePayPalWebhook = async (req, res) => {
  const webhookEvent = req.body;
  console.log(webhookEvent);

  try {
    // Validate the webhook (optional but recommended)
    const isValid = await validateWebhook(req.headers, req.body);
    if (!isValid) {
      return res.status(400).send("Invalid Webhook");
    }

    // Handle different event types from PayPal
    switch (webhookEvent.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptureCompleted(webhookEvent);
        break;
      case "PAYMENT.CAPTURE.REFUNDED":
        await handlePaymentRefunded(webhookEvent);
        break;
      // Add more event types as needed
      default:
        console.log(`Unhandled event type: ${webhookEvent.event_type}`);
    }

    // Respond with 200 OK and include the webhook event data
    res.status(200).json({
      message: "Webhook received",
      webhookEvent,
    });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};

const handlePaymentCaptureCompleted = async (webhookEvent) => {
  const captureId = webhookEvent.resource.id;
  let tourId, roomId, bookingId;

  try {
    // Ensure custom_id is defined before parsing
    if (webhookEvent.resource.custom_id) {
      const customIdObj = JSON.parse(webhookEvent.resource.custom_id);
      tourId = customIdObj.tourId;
      roomId = customIdObj.roomId;
      bookingId = customIdObj.bookingId;
    } else {
      throw new Error("Missing custom_id in webhook event");
    }

    // Find and update the booking by ID
    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.status = "confirmed";
      booking.paymentMethod = 'paypal';
      await booking.save();
    } else {
      console.error("Booking not found for ID:", bookingId);
      return;
    }

    // Ensure supplementary_data exists before accessing order_id
    const relatedIds = webhookEvent.resource.supplementary_data?.related_ids;
    if (relatedIds?.order_id) {
      // Find and update the payment by order ID
      const payment = await Payment.findOne({
        transactionId: relatedIds.order_id, // Use order ID to find the initial payment
      });
      if (payment) {
        payment.transactionId = captureId; // Now store the capture ID
        payment.status = "completed";
        await payment.save();
      } else {
        console.error("Payment not found for order ID:", relatedIds.order_id);
        return;
      }
    } else {
      console.error("Missing order_id in supplementary_data");
      return;
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
  }
};

// @desc Handle payment refund completed
const handlePaymentRefunded = async (webhookEvent) => {
  const captureId = webhookEvent.resource.id; // This should be the correct capture ID
  const bookingId = webhookEvent.resource.invoice_id; // Ensure this is correct

  const payment = await Payment.findOne({ captureId });
  console.log(payment); // Look up by captureId
  if (!payment) {
    console.error("Payment not found for captureId:", captureId);
    return; // Early return if payment does not exist
  }

  const booking = await Booking.findById(bookingId);
  if (booking) {
    booking.status = "refunded";
    await booking.save();
  } else {
    console.error("Booking not found for ID:", bookingId);
  }
};

// @desc Validate PayPal webhook (optional but recommended)
const validateWebhook = async (headers, body) => {
  // Implement webhook validation logic using PayPal's API or signature verification
  return true; // For now, assume it's valid
};


const capturePayment = asyncHandler(async (req, res) => {
  const { orderID } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    const custom_id = JSON.parse(capture.result.purchase_units[0].custom_id);
    const booking = await Booking.findById(custom_id.bookingId);

    if (booking) {
      booking.status = "confirmed";
      booking.paymentId = capture.result.id;
      await booking.save();

      // Update car availability if it's a car booking
      if (booking.bookingType === "Car" && booking.car) {
        const car = await Car.findById(booking.car);
        if (car) {
          car.available = false;
          await car.save();
        }
      }
    }

    res.json({
      captureID: capture.result.id,
      bookingId: custom_id.bookingId
    });
  } catch (err) {
    res.status(500);
    throw new Error("Error capturing PayPal payment");
  }
});

module.exports = {
  createPayPalPayment,
  handlePayPalWebhook,
  getAllPayments,
  capturePayment,
  deletePayment
};

// ===================== STRIPE INTEGRATION =====================

// @desc Create Stripe PaymentIntent
// @route POST /api/payments/stripe/create-intent
// @access Private
const createStripePaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'usd', bookingId, description } = req.body;

  if (!amount || !bookingId) {
    return res.status(400).json({ message: 'amount and bookingId are required' });
  }

  // Create a txRef we can use across providers
  const txRef = `stripe_${bookingId}_${Date.now()}`;

  // Create Payment record in pending state
  await Payment.create({
    amount,
    currency: currency.toUpperCase(),
    booking: bookingId,
    txRef,
    status: 'pending',
    provider: 'stripe',
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100), // cents
    currency,
    description: description || 'Dorze Tours booking',
    metadata: { bookingId, txRef },
    automatic_payment_methods: { enabled: true },
  });

  // Save intent id for cross-reference
  await Payment.findOneAndUpdate(
    { txRef },
    { stripePaymentIntentId: paymentIntent.id }
  );

  res.status(200).json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    txRef,
  });
});

// @desc Stripe webhook
// @route POST /api/payments/stripe/webhook
// @access Public
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body is a Buffer because of express.raw
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const { bookingId, txRef } = paymentIntent.metadata || {};

      if (txRef) {
        const payment = await Payment.findOneAndUpdate(
          { txRef },
          { status: 'completed' },
          { new: true }
        );
        if (payment && payment.booking) {
          await Booking.findByIdAndUpdate(payment.booking, {
            status: 'confirmed',
            paymentMethod: 'credit card'
          });
        }
      }

      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, { status: 'confirmed', paymentMethod: 'credit card' });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const { txRef } = paymentIntent.metadata || {};
      if (txRef) {
        await Payment.findOneAndUpdate(
          { txRef },
          { status: 'failed' }
        );
      }
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
};

module.exports.createStripePaymentIntent = createStripePaymentIntent;
module.exports.handleStripeWebhook = handleStripeWebhook;
