import mongoose, { Schema, Document, Model } from 'mongoose';

/** Enterprise tour package — stored in collection `tours`, model name `Tour` for booking/review refs. */

const activityItemSchema = new Schema(
    {
        time: String,
        activity: { type: String, required: true },
        description: String,
    },
    { _id: false }
);

const itineraryDaySchema = new Schema(
    {
        day: { type: Number, required: true },
        title: String,
        description: String,
        activities: [activityItemSchema],
        mealsIncluded: [{ type: String }],
        overnight: String,
        accommodationLevel: String,
    },
    { _id: false }
);

const groupPricingTierSchema = new Schema(
    {
        minGuests: { type: Number, default: 1 },
        maxGuests: Number,
        pricePerPerson: Number,
        fixedPrice: Number,
    },
    { _id: false }
);

const seasonalPricingSchema = new Schema(
    {
        name: String,
        startMonth: { type: Number, min: 1, max: 12 },
        startDay: { type: Number, min: 1, max: 31 },
        endMonth: { type: Number, min: 1, max: 12 },
        endDay: { type: Number, min: 1, max: 31 },
        multiplier: { type: Number, default: 1 },
        overrideBasePrice: Number,
    },
    { _id: false }
);

const childPolicySchema = new Schema(
    {
        childAgeMax: Number,
        discountPercent: Number,
        freeUnderAge: Number,
    },
    { _id: false }
);

const hotelOptionSchema = new Schema(
    {
        name: String,
        notes: String,
    },
    { _id: false }
);

const accommodationMappingSchema = new Schema(
    {
        destination: String,
        hotelCategory: String,
        hotelOptions: [hotelOptionSchema],
    },
    { _id: false }
);

const transportSegmentSchema = new Schema(
    {
        type: { type: String },
        route: String,
        vehicleType: String,
    },
    { _id: false }
);

const addonSchema = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        optional: { type: Boolean, default: true },
        description: String,
    },
    { _id: false }
);

const tourPackageSchema = new Schema(
    {
        schemaVersion: { type: Number, default: 2 },

        packageCode: { type: String, trim: true, sparse: true },
        title: { type: String, required: true, trim: true },
        slug: { type: String, trim: true, sparse: true },
        shortDescription: String,
        fullDescription: String,
        category: String,
        tourType: {
            type: String,
            enum: ['cultural', 'adventure', 'historical', 'trekking', 'wildlife', 'photography', 'mixed'],
            default: 'cultural',
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'published',
        },

        duration: {
            days: { type: Number, default: 1 },
            nights: { type: Number, default: 0 },
        },
        destinations: [{ type: String, trim: true }],
        startLocation: String,
        endLocation: String,

        itinerary: [itineraryDaySchema],

        basePrice: { type: Number, min: 0, default: 0 },
        pricingType: {
            type: String,
            enum: ['per_person', 'fixed_group', 'hybrid'],
            default: 'per_person',
        },
        groupPricing: [groupPricingTierSchema],
        seasonalPricing: [seasonalPricingSchema],
        childPolicy: childPolicySchema,

        minGuests: { type: Number, default: 1, min: 1 },
        maxGuests: { type: Number, default: 20 },
        departureType: {
            type: String,
            enum: ['fixed_schedule', 'on_request', 'rolling'],
            default: 'on_request',
        },
        bookingCutoffHours: { type: Number, default: 24, min: 0 },

        included: [{ type: String }],
        excluded: [{ type: String }],

        accommodations: [accommodationMappingSchema],
        transportSegments: [transportSegmentSchema],

        depositPercent: { type: Number, min: 0, max: 100, default: 20 },
        cancellationPolicy: String,
        childDiscountRules: String,

        addons: [addonSchema],

        guideRequired: { type: Boolean, default: false },
        vehicleRequired: { type: Boolean, default: true },
        hotelRequired: { type: Boolean, default: false },

        coverImage: String,
        gallery: [{ type: String }],

        metaTitle: String,
        metaDescription: String,

        /** Legacy flat fields (migration / compat) */
        description: String,
        destination: String,
        price: { type: Number, min: 0 },
        durationLegacy: String,
        imageUrl: [{ type: String }],
        averageRating: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'moderate', 'challenging'],
            default: 'medium',
        },
        featured: { type: Boolean, default: false },
        highlights: [{ type: String }],
        legacyPrice: Number,
        legacyDestination: String,

        images: [{ type: String }],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

tourPackageSchema.index({ slug: 1 }, { unique: true, sparse: true });
tourPackageSchema.index({ packageCode: 1 }, { sparse: true });
tourPackageSchema.index({ status: 1 });
tourPackageSchema.index({ category: 1 });
tourPackageSchema.index({ 'duration.days': 1 });
tourPackageSchema.index({ destinations: 1 });
tourPackageSchema.index({ title: 'text', shortDescription: 'text', fullDescription: 'text' });

/** Resolved display price for listings */
tourPackageSchema.virtual('startingPrice').get(function () {
    const doc = this as any;
    if (doc.basePrice != null && doc.basePrice > 0) return doc.basePrice;
    if (doc.price != null && doc.price > 0) return doc.price;
    if (doc.legacyPrice != null) return doc.legacyPrice;
    return 0;
});

export interface ITourPackage extends Document {
    schemaVersion?: number;
    title: string;
    slug?: string;
    packageCode?: string;
    [key: string]: any;
}

export const createTourPackageModel = (): Model<ITourPackage> => {
    if (mongoose.models.Tour) {
        return mongoose.model<ITourPackage>('Tour');
    }
    return mongoose.model<ITourPackage>('Tour', tourPackageSchema, 'tours');
};
