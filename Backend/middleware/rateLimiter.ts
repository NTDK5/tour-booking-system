import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../config/redis';
import logger from '../utils/logger';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    store: (process.env.NODE_ENV === 'production') ? new RedisStore({
        sendCommand: (...args: string[]) => redis.call(...args),
    }) : undefined,
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).json({ message: options.message });
    },
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 failed login attempts per hour
    skipSuccessfulRequests: true,
    store: (process.env.NODE_ENV === 'production') ? new RedisStore({
        sendCommand: (...args: string[]) => redis.call(...args),
    }) : undefined,
    message: 'Too many login attempts, please try again after an hour',
});
