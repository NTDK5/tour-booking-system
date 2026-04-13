import { z } from 'zod';

export const bookingSchema = z.object({
    bookingType: z.enum(['tour', 'lodge', 'car']),
    tour: z.string().optional(),
    tourId: z.string().optional(),
    lodge: z.string().optional(),
    lodgeId: z.string().optional(),
    car: z.string().optional(),
    carId: z.string().optional(),
    startDate: z.string().pipe(z.coerce.date()).optional(),
    endDate: z.string().pipe(z.coerce.date()).optional(),
    bookingDate: z.string().pipe(z.coerce.date()).optional(),
    checkInDate: z.string().pipe(z.coerce.date()).optional(),
    checkOutDate: z.string().pipe(z.coerce.date()).optional(),
    numberOfPeople: z.number().int().positive().optional(),
    totalPrice: z.number().nonnegative().optional(),
    paymentMethod: z.enum(['paypal', 'card', 'cash']),
    roomType: z.string().optional(),
    pickupLocation: z.string().optional(),
    dropoffLocation: z.string().optional(),
    isRequest: z.boolean().optional(),
    customCarRequest: z.any().optional(),
});

export const updateBookingSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    isPaid: z.boolean().optional(),
});
