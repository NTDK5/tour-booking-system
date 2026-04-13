import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
import connectDB from './config/db';
import logger from './utils/logger';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import { apiLimiter } from './middleware/rateLimiter';

// Routes
import userRoutes from './routes/userRoutes';
import tourRoutes from './routes/tourRoutes';
import bookingRoutes from './routes/bookingRoutes';
import reviewRoutes from './routes/reviewRoutes';
import paymentRoutes from './routes/paymentRoutes';
import lodgeRoutes from './routes/lodgeRoutes';
import carRoutes from './routes/carRoutes';
import customTripRoutes from './routes/customTripRoutes';
import adminRoutes from './routes/adminRoutes';
import destinationRoutes from './routes/destinationRoutes';
import activityRoutes from './routes/activityRoutes';
import { handleStripeWebhook } from './controllers/paymentController';

// Init passport config
import './config/passport';

console.log('Starting server initialization...');
const app = express();
console.log('Express app created');

// Database connection initialized in startServer()

// Security Middleware
console.log('Setting up helmet...');
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for debugging image display
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
console.log('Setting up cors...');
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
}));

// Logging
console.log('Setting up morgan...');
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Stripe Webhook (Must be before express.json())
console.log('Setting up stripe webhook...');
app.post('/api/payments/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Body Parser
console.log('Setting up body parsers...');
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Rate Limiting
console.log('Setting up rate limiting...');
// app.use('/api/', apiLimiter);

// Session for Passport (Optional with JWT, but kept for compatibility)
console.log('Setting up session...');
app.use(session({
    secret: process.env.SESSION_SECRET || 'omotribestour',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
    }
}));
console.log('Session setup ok');

console.log('Setting up passport...');
app.use(passport.initialize());
app.use(passport.session());
console.log('Passport setup ok');

// Static Files
console.log('Setting up static files...');
app.use('/uploads', express.static('uploads'));

// API Routes
console.log('Setting up routes...');
app.use('/api/users', userRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/lodges', lodgeRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/custom-trips', customTripRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/activities', activityRoutes);
console.log('Routes setup ok');

// Error Handling
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    console.log('Inside startServer...');
    try {
        // Connect to Database
        console.log('Calling connectDB...');
        await connectDB();
        console.log('connectDB resolved');

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
            logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error: any) {
        console.error(`SERVER STARTUP CRITICAL ERROR: ${error.message}`);
        logger.error(`Server failed to start: ${error.message}`);
        process.exit(1);
    }
};

startServer();
