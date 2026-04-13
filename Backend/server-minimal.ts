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
import { handleStripeWebhook } from './controllers/paymentController';

// Init passport config
import './config/passport';

console.log('Imports in minimal server ok');
const app = express();

console.log('Setting up middleware...');
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// app.use('/api/', apiLimiter);
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
app.use(passport.initialize());
app.use(passport.session());
console.log('Middleware setup (session+passport) ok');

const start = async () => {
    console.log('Minimal server starting...');
    try {
        await connectDB();
        console.log('DB connected in minimal server');
        app.get('/', (req, res) => res.send('OK'));
        app.listen(5555, () => console.log('Minimal server on 5555'));
    } catch (err: any) {
        console.error('Minimal server failed:', err.message);
    }
};

start();
