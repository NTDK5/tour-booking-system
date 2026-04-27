import { Request, Response } from 'express';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import paypal from '@paypal/checkout-server-sdk';
import Stripe from 'stripe';
import { client } from '../utils/paypalClient';
import Booking from '../models/bookingModel';
import Payment from '../models/paymentModel';
import { applyGatewayPaymentFailure, applyGatewayPaymentSuccess } from '../modules/bookings/payments/bookingPaymentService';
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

        const txRef = `pp_${orderID}`;
        const already = booking.paymentLedger?.some(
            (e: any) => e.transactionReference === txRef && e.status === 'completed'
        );
        if (already) {
            res.json({ message: 'Payment already recorded', result: capture.result });
            return;
        }

        const captureDetails = purchaseUnit.payments.captures[0];

        const payment = await Payment.create({
            amount: Number(captureDetails.amount.value),
            booking: bookingId,
            status: 'completed',
            provider: 'paypal',
            txRef,
            transactionId: capture.result.id,
        });

        await applyGatewayPaymentSuccess(booking, {
            amount: Number(captureDetails.amount.value),
            currency: captureDetails.amount.currency_code || 'USD',
            provider: 'paypal',
            txRef,
            transactionId: capture.result.id,
            legacyPaymentId: payment._id as mongoose.Types.ObjectId,
        });

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

// @desc Retrieve Stripe payment intent status
// @route GET /api/payments/stripe-intent/:intentId
export const getStripeIntentStatus = asyncHandler(async (req: Request, res: Response) => {
    const intent = await stripe.paymentIntents.retrieve(req.params.intentId);
    res.status(200).json({
        id: intent.id,
        status: intent.status,
        bookingId: intent.metadata?.bookingId,
        clientSecret: intent.client_secret,
    });
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

            const txRef = `st_${intent.id}`;
            const already = booking.paymentLedger?.some(
                (e: any) => e.transactionReference === txRef && e.status === 'completed'
            );
            if (already) {
                logger.info(`Stripe payment ${intent.id} already recorded for booking ${bookingId}.`);
                return res.json({ received: true });
            }

            let paymentDoc = await Payment.findOne({ stripePaymentIntentId: intent.id });
            if (paymentDoc) {
                paymentDoc.status = 'completed';
                await paymentDoc.save();
            } else {
                paymentDoc = await Payment.create({
                    amount: intent.amount_received ? intent.amount_received / 100 : intent.amount / 100,
                    booking: bookingId,
                    status: 'completed',
                    provider: 'stripe',
                    txRef,
                    stripePaymentIntentId: intent.id,
                });
            }

            await applyGatewayPaymentSuccess(booking, {
                amount: intent.amount_received ? intent.amount_received / 100 : intent.amount / 100,
                currency: (intent.currency || 'usd').toUpperCase(),
                provider: 'stripe',
                txRef,
                stripePaymentIntentId: intent.id,
                legacyPaymentId: paymentDoc._id as mongoose.Types.ObjectId,
            });

            await booking.save();

            logger.info(`Stripe payment succeeded for booking: ${bookingId}`);
        } catch (dbErr: any) {
            logger.error(`Database error during Stripe webhook: ${dbErr.message}`);
            return res.status(500).send('Internal Server Error');
        }
    } else if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
        const intent = event.data.object as Stripe.PaymentIntent;
        const bookingId = intent.metadata.bookingId;
        if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (booking) {
                const txRef = `st_${intent.id}`;
                await Payment.findOneAndUpdate(
                    { stripePaymentIntentId: intent.id },
                    { status: 'failed' },
                    { new: true }
                );
                applyGatewayPaymentFailure(booking, {
                    provider: 'stripe',
                    txRef,
                    stripePaymentIntentId: intent.id,
                    notes: event.type === 'payment_intent.canceled' ? 'Payment intent canceled' : 'Payment failed',
                });
                await booking.save();
            }
        }
    }

    res.json({ received: true });
};
