import { z } from 'zod';
import { tourPackageCreateSchema } from '../modules/packages/validators/packageSchemas';

/** Tour / package create — aligned with TourPackage model (`title`, not legacy `name`). */
export const tourSchema = tourPackageCreateSchema;

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
