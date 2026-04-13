import { z } from 'zod';

export const tourSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be a positive number'),
    duration: z.string(),
    maxGroupSize: z.number().int().positive(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    category: z.string(),
    images: z.array(z.string()).optional(),
    startLocation: z.string().optional(),
});

export const lodgeSchema = z.object({
    name: z.string().min(3),
    location: z.string(),
    description: z.string(),
    pricePerNight: z.number().positive(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    availableRooms: z.number().int().nonnegative(),
});

export const carSchema = z.object({
    name: z.string(),
    brand: z.string(),
    carModel: z.string(),
    year: z.number().int().min(1900),
    transmission: z.enum(['Manual', 'Automatic']),
    fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']),
    seats: z.number().int().positive(),
    pricePerDay: z.number().positive(),
    location: z.string(),
    description: z.string(),
    images: z.array(z.string()).optional(),
});
