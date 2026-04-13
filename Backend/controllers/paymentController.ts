import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import paypal from '@paypal/checkout-server-sdk';
import Stripe from 'stripe';
import { client } from '../utils/paypalClient';
import Booking from '../models/bookingModel';
import Payment from '../models/paymentModel';
import Tour from '../models/tourModel';
import Lodge from '../models/lodgeModel';
import Car from '../models/carModel';
import logger from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia' as any,
});

// @desc Create PayPal order
// @route POST /api/payments/create-paypal-order
export const createPayPalOrder = asyncHandler(async (req: any, res: any) => {
    const { bookingId, totalAmount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    const request = new (paypal.orders as any).OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: totalAmount.toString(),
                },
                custom_id: bookingId,
            },
        ],
    });

    try {
        const order = await client().execute(request);
        res.json({ id: order.result.id });
    } catch (err: any) {
        logger.error('PayPal Order Error', err);
        res.status(500);
        throw new Error('Failed to create PayPal order');
    }
});

// @desc Capture PayPal payment
// @route POST /api/payments/capture-paypal
export const capturePayPalPayment = asyncHandler(async (req: any, res: any) => {
    const { orderID } = req.body;

    if (!orderID) {
        res.status(400);
        throw new Error('OrderID is required');
    }

    const request = new (paypal.orders as any).OrdersCaptureRequest(orderID);

    try {
        const capture = await client().execute(request);
        const purchaseUnit = capture.result.purchase_units[0];
        const bookingId = purchaseUnit.custom_id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            logger.error(`Booking ${bookingId} not found during PayPal capture`);
            res.status(404);
            throw new Error('Booking not found');
        }

        // Idempotency: skip if already confirmed
        if (booking.status === 'confirmed') {
            res.json({ message: 'Booking already confirmed', result: capture.result });
            return;
        }

        const captureDetails = purchaseUnit.payments.captures[0];

        // Create Payment record
        const payment = await Payment.create({
            amount: captureDetails.amount.value,
            booking: bookingId,
            status: 'completed',
            provider: 'paypal',
            txRef: `pp_${orderID}`,
            transactionId: capture.result.id,
        });

        // Update Booking
        booking.status = 'confirmed' as any;
        booking.paymentId = payment._id as any;
        await booking.save();

        logger.info(`PayPal Payment captured for booking: ${bookingId}`);
        res.json(capture.result);
    } catch (err: any) {
        logger.error('PayPal Capture Error', err);
        res.status(err.statusCode || 500);
        throw new Error(err.message || 'Failed to capture PayPal payment');
    }
});

// @desc Create Stripe Payment Intent
// @route POST /api/payments/create-stripe-intent
export const createStripeIntent = asyncHandler(async (req: any, res: any) => {
    const { bookingId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: { bookingId },
    });

    // Create pending payment record
    await Payment.create({
        amount,
        booking: bookingId,
        status: 'pending',
        provider: 'stripe',
        txRef: `st_${paymentIntent.id}`,
        stripePaymentIntentId: paymentIntent.id,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
});

// @desc Stripe Webhook
export const handleStripeWebhook = async (req: any, res: any) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        logger.error('STRIPE_WEBHOOK_SECRET is not set');
        return res.status(500).send('Webhook Secret missing');
    }

    try {
        // Stripe requires the RAW body for signature verification
        const rawBody = req.body; // server.ts uses express.raw() for this route
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
        logger.error(`Stripe Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent;
        const bookingId = intent.metadata.bookingId;

        if (!bookingId) {
            logger.error('No bookingId found in PaymentIntent metadata');
            return res.status(400).send('No bookingId found');
        }

        try {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                logger.error(`Booking ${bookingId} not found in Stripe Webhook`);
                return res.status(404).send('Booking not found');
            }

            // Idempotency check
            if (booking.status === 'confirmed') {
                logger.info(`Booking ${bookingId} already confirmed, skipping.`);
                return res.json({ received: true });
            }

            await Payment.findOneAndUpdate(
                { stripePaymentIntentId: intent.id },
                { status: 'completed' },
                { upsert: true }
            );

            booking.status = 'confirmed' as any;
            await booking.save();

            logger.info(`Stripe payment succeeded for booking: ${bookingId}`);
        } catch (dbErr: any) {
            logger.error(`Database error during Stripe webhook: ${dbErr.message}`);
            return res.status(500).send('Internal Server Error');
        }
    }

    res.json({ received: true });
};
