import { z } from 'zod';

const travelerSchema = z.object({
    fullName: z.string().min(1),
    travelerType: z.enum(['adult', 'child', 'infant']).optional(),
    passportNumber: z.string().optional(),
    nationality: z.string().optional(),
    dateOfBirth: z.union([z.string(), z.date()]).optional(),
    gender: z.string().optional(),
    dietaryRequirements: z.string().optional(),
    emergencyContact: z
        .object({
            name: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().optional(),
        })
        .optional(),
});

export const bookingSchema = z.object({
    bookingType: z.enum(['tour', 'lodge', 'car']),
    tour: z.string().optional(),
    tourId: z.string().optional(),
    departureId: z.string().optional(),
    children: z.number().int().min(0).optional(),
    travelers: z.array(travelerSchema).optional(),
    selectedAddons: z
        .array(
            z.union([
                z.string(),
                z.object({ name: z.string(), price: z.number().nonnegative().optional() }),
            ])
        )
        .optional(),
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

export const payBalanceSchema = z.object({
    amount: z.coerce.number().positive(),
});

export const manualPaymentSchema = z.object({
    amount: z.coerce.number().positive(),
    method: z.string().max(64).optional(),
    notes: z.string().max(500).optional(),
});

export const updateBookingSchema = z.object({
    status: z.enum(['draft', 'pending_payment', 'confirmed', 'cancelled', 'completed']).optional(),
    proposedPrice: z.number().nonnegative().optional(),
    notes: z.string().max(500).optional(),
    comment: z.string().max(500).optional(),
    offer: z.object({
        finalPrice: z.number().nonnegative(),
        currency: z.string().default('USD'),
        adminNotes: z.string().max(1000).optional(),
        validUntil: z.string().optional(),
        breakdown: z.array(
            z.object({
                label: z.string(),
                amount: z.number().nonnegative(),
                reason: z.string().optional(),
            })
        ).optional(),
    }).optional(),
});
