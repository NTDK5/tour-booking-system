import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const registerSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    country: z.string().optional(),
    role: z.enum(['user', 'admin']).optional(),
});

export const bookingSchema = z.object({
    bookingType: z.enum(['Tour', 'Lodge', 'Car']),
    tourId: z.string().optional(),
    lodgeId: z.string().optional(),
    carId: z.string().optional(),
    numberOfPeople: z.number().int().min(1).default(1),
    paymentMethod: z.enum(['credit card', 'paypal', 'bank transfer']).optional(),
    notes: z.string().max(500).optional(),
    checkInDate: z.string().optional(), // ISO string
    checkOutDate: z.string().optional(),
    roomType: z.string().optional(),
    pickupLocation: z.string().optional(),
    dropoffLocation: z.string().optional(),
    bookingDate: z.string().optional(),
});

export const paymentSchema = z.object({
    bookingId: z.string(),
    amount: z.number().positive(),
    paymentMethod: z.enum(['paypal', 'stripe']),
});
