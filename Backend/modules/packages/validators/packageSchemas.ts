import { z } from 'zod';

/** Public/admin create & update — aligned with TourPackage + legacy payloads */
export const tourPackageCreateSchema = z
    .object({
        title: z.string().min(3, 'Title must be at least 3 characters'),
        description: z.string().min(10).optional(),
        shortDescription: z.string().optional(),
        fullDescription: z.string().optional(),
        destination: z.string().optional(),
        destinations: z.array(z.string()).optional(),
        duration: z
            .union([
                z.number().int().positive(),
                z.string(),
                z.object({
                    days: z.number().int().positive(),
                    nights: z.number().int().min(0).optional(),
                }),
            ])
            .optional(),
        durationLegacy: z.string().optional(),
        price: z.number().nonnegative().optional(),
        basePrice: z.number().nonnegative().optional(),
        category: z.string().optional(),
        tourType: z
            .enum(['cultural', 'adventure', 'historical', 'trekking', 'wildlife', 'photography', 'mixed'])
            .optional(),
        difficulty: z.enum(['easy', 'medium', 'hard', 'moderate', 'challenging']).optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
        maxGuests: z.number().int().positive().optional(),
        /** Frontend sends groupSize → mapped in controller */
        groupSize: z.number().int().positive().optional(),
        featured: z.boolean().optional(),
        highlights: z.array(z.string()).optional(),
        included: z.array(z.string()).optional(),
        excluded: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
        imageUrl: z.array(z.string()).optional(),
        gallery: z.array(z.string()).optional(),
        coverImage: z.string().optional(),
        itinerary: z.array(z.any()).optional(),
        slug: z.string().optional(),
        packageCode: z.string().optional(),
        addons: z.array(z.any()).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
    })
    .passthrough();

export type TourPackageCreateInput = z.infer<typeof tourPackageCreateSchema>;

const itineraryDaySchema = z.object({
    day: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    activities: z.array(z.any()).optional(),
    mealsIncluded: z.array(z.string()).optional(),
    overnight: z.string().optional(),
    accommodationLevel: z.string().optional(),
});

export const packageSectionSchemas = {
    basic: z.object({
        packageCode: z.string().optional(),
        title: z.string().min(1).optional(),
        slug: z.string().optional(),
        shortDescription: z.string().optional(),
        fullDescription: z.string().optional(),
        category: z.string().optional(),
        tourType: z
            .enum(['cultural', 'adventure', 'historical', 'trekking', 'wildlife', 'photography', 'mixed'])
            .optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
        description: z.string().optional(),
    }),
    route: z.object({
        duration: z
            .object({
                days: z.number().int().positive(),
                nights: z.number().int().min(0).optional(),
            })
            .optional(),
        destinations: z.array(z.string()).optional(),
        startLocation: z.string().optional(),
        endLocation: z.string().optional(),
        destination: z.string().optional(),
    }),
    itinerary: z.object({
        itinerary: z.array(itineraryDaySchema),
    }),
    pricing: z.object({
        basePrice: z.number().nonnegative().optional(),
        price: z.number().nonnegative().optional(),
        pricingType: z.enum(['per_person', 'fixed_group', 'hybrid']).optional(),
        groupPricing: z.array(z.any()).optional(),
        seasonalPricing: z.array(z.any()).optional(),
        childPolicy: z.any().optional(),
        depositPercent: z.number().min(0).max(100).optional(),
    }),
    availability: z.object({
        minGuests: z.number().int().min(1).optional(),
        maxGuests: z.number().int().positive().optional(),
        departureType: z.enum(['fixed_schedule', 'on_request', 'rolling']).optional(),
        bookingCutoffHours: z.number().nonnegative().optional(),
    }),
    inclusions: z.object({
        included: z.array(z.string()).optional(),
        excluded: z.array(z.string()).optional(),
        highlights: z.array(z.string()).optional(),
    }),
    accommodation: z.object({
        accommodations: z.array(z.any()),
    }),
    transport: z.object({
        transportSegments: z.array(z.any()),
    }),
    addons: z.object({
        addons: z.array(z.any()),
    }),
    media: z.object({
        coverImage: z.string().optional(),
        gallery: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
        imageUrl: z.array(z.string()).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
    }),
    bookingRules: z.object({
        depositPercent: z.number().min(0).max(100).optional(),
        cancellationPolicy: z.string().optional(),
        childDiscountRules: z.string().optional(),
    }),
    resources: z.object({
        guideRequired: z.boolean().optional(),
        vehicleRequired: z.boolean().optional(),
        hotelRequired: z.boolean().optional(),
    }),
} as const;

export type PackageSectionKey = keyof typeof packageSectionSchemas;
