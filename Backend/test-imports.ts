console.log('Testing imports...');
import dotenv from 'dotenv';
dotenv.config();
console.log('dotenv ok');

import express from 'express';
console.log('express ok');
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
console.log('basic deps ok');

import connectDB from './config/db';
console.log('config/db ok');
import logger from './utils/logger';
console.log('utils/logger ok');
import { notFound, errorHandler } from './middleware/errorMiddleware';
console.log('middleware/errorMiddleware ok');
import { apiLimiter } from './middleware/rateLimiter';
console.log('middleware/rateLimiter ok');

console.log('Testing routes...');
import userRoutes from './routes/userRoutes';
console.log('routes/userRoutes ok');
import tourRoutes from './routes/tourRoutes';
console.log('routes/tourRoutes ok');
import bookingRoutes from './routes/bookingRoutes';
console.log('routes/bookingRoutes ok');
import reviewRoutes from './routes/reviewRoutes';
console.log('routes/reviewRoutes ok');
import paymentRoutes from './routes/paymentRoutes';
console.log('routes/paymentRoutes ok');
import lodgeRoutes from './routes/lodgeRoutes';
console.log('routes/lodgeRoutes ok');
import carRoutes from './routes/carRoutes';
console.log('routes/carRoutes ok');
import customTripRoutes from './routes/customTripRoutes';
console.log('routes/customTripRoutes ok');

console.log('Testing controllers...');
import { handleStripeWebhook } from './controllers/paymentController';
console.log('controllers/paymentController ok');

console.log('Testing passport config...');
import './config/passport';
console.log('config/passport ok');

console.log('All imports successful!');
