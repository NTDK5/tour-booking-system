import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    createPayPalOrder,
    capturePayPalPayment,
    createStripeIntent,
    handleStripeWebhook,
} from '../controllers/paymentController';

const router = express.Router();

router.post('/create-paypal-order', protect, createPayPalOrder);
router.post('/capture-paypal', protect, capturePayPalPayment);
router.post('/create-stripe-intent', protect, createStripeIntent);

// Webhook (No protect, uses Stripe signature)
// Webhook is handled in server.ts for raw body parsing
// router.post('/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
