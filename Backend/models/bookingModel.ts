import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBooking extends Document {
    user: mongoose.Types.ObjectId;
    paymentId?: mongoose.Types.ObjectId | string; // Can be ref or direct string from gateway
    tour?: mongoose.Types.ObjectId;
    lodge?: mongoose.Types.ObjectId;
    car?: mongoose.Types.ObjectId;
    resource?: {
        resourceId: mongoose.Types.ObjectId;
        resourceType: 'Lodge' | 'Tour' | 'Car' | 'Guide' | 'Service';
    };
    bookingType: 'Tour' | 'Lodge' | 'Car';
    startDate?: Date;
    endDate?: Date;
    bookingDate: Date;
    numberOfPeople: number;
    totalPrice: number;
    status: 'pending' | 'under_review' | 'offer_sent' | 'confirmed' | 'cancelled' | 'expired' | 'refunded' | 'submitted' | 'offered' | 'accepted' | 'rejected';
    paymentMethod: 'credit card' | 'card' | 'paypal' | 'bank transfer' | 'cash';
    notes?: string;
    internalNotes?: string;
    source: 'online' | 'offline';
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    priceOverride?: number;
    proposedPrice?: number;
    offer?: {
        finalPrice: number;
        currency: string;
        breakdown: {
            label: string;
            amount: number;
            reason?: string;
        }[];
        adminNotes?: string;
        validUntil?: Date;
        createdBy?: mongoose.Types.ObjectId;
        createdAt?: Date;
        basedOnEstimate?: number;
    };
    estimateSnapshot?: {
        estimatedBudget?: number;
        finalPrice?: number;
        priceChangeReasons?: string[];
        pricingBreakdown?: {
            basePerDay?: number;
            daysCost?: number;
            optionsCost?: number;
            modeMultiplier?: number;
            subtotal?: number;
            finalTotal?: number;
        };
    };
    isRequest?: boolean;
    customTrip?: mongoose.Types.ObjectId;
    history: {
        status: string;
        timestamp: Date;
        comment?: string;
    }[];
    checkInDate?: Date;
    checkOutDate?: Date;
    roomType?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    customCarRequest?: {
        carType: string;
        passengerCapacity: number;
        transmission: 'automatic' | 'manual' | 'any';
        checkInDate: Date;
        checkOutDate: Date;
        notes?: string;
    };
}

const bookingSchema: Schema<IBooking> = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        paymentId: {
            type: Schema.Types.Mixed, // Accommodate both ObjectId and direct IDs
        },
        tour: {
            type: Schema.Types.ObjectId,
            ref: 'Tour',
        },
        lodge: {
            type: Schema.Types.ObjectId,
            ref: 'Lodge',
        },
        bookingType: {
            type: String,
            enum: ['Tour', 'Lodge', 'Car'],
            required: true,
        },
        bookingDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        numberOfPeople: {
            type: Number,
            required: true,
            min: 1,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'under_review', 'offer_sent', 'confirmed', 'cancelled', 'expired', 'refunded', 'submitted', 'offered', 'accepted', 'rejected'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['credit card', 'card', 'paypal', 'bank transfer', 'cash'],
            required: true,
        },
        notes: { type: String, maxlength: 500 },
        internalNotes: { type: String, maxlength: 1000 },
        source: {
            type: String,
            enum: ['online', 'offline'],
            default: 'online',
        },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'partial', 'paid'],
            default: 'unpaid',
        },
        priceOverride: {
            type: Number,
            min: 0,
        },
        proposedPrice: {
            type: Number,
            min: 0,
        },
        offer: {
            finalPrice: { type: Number, min: 0 },
            currency: { type: String, default: 'USD' },
            breakdown: [
                {
                    label: { type: String },
                    amount: { type: Number, min: 0 },
                    reason: { type: String },
                }
            ],
            adminNotes: { type: String, maxlength: 1000 },
            validUntil: { type: Date },
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            createdAt: { type: Date },
            basedOnEstimate: { type: Number, min: 0 },
        },
        estimateSnapshot: {
            estimatedBudget: { type: Number, min: 0 },
            finalPrice: { type: Number, min: 0 },
            priceChangeReasons: [{ type: String }],
            pricingBreakdown: {
                basePerDay: { type: Number, min: 0 },
                daysCost: { type: Number, min: 0 },
                optionsCost: { type: Number, min: 0 },
                modeMultiplier: { type: Number, min: 0 },
                subtotal: { type: Number, min: 0 },
                finalTotal: { type: Number, min: 0 },
            }
        },
        isRequest: {
            type: Boolean,
            default: false,
        },
        customTrip: {
            type: Schema.Types.ObjectId,
            ref: 'CustomTrip',
        },
        history: [
            {
                status: String,
                timestamp: { type: Date, default: Date.now },
                comment: String,
            },
        ],
        checkInDate: { type: Date },
        checkOutDate: { type: Date },
        roomType: { type: String },
        car: {
            type: Schema.Types.ObjectId,
            ref: 'Car',
        },
        resource: {
            resourceId: {
                type: Schema.Types.ObjectId,
                ref: 'Resource',
            },
            resourceType: {
                type: String,
                enum: ['Lodge', 'Tour', 'Car', 'Guide', 'Service'],
            },
        },
        startDate: { type: Date },
        endDate: { type: Date },
        pickupLocation: { type: String },
        dropoffLocation: { type: String },
        customCarRequest: {
            carType: { type: String },
            passengerCapacity: { type: Number },
            transmission: { type: String, enum: ['automatic', 'manual', 'any'] },
            checkInDate: { type: Date },
            checkOutDate: { type: Date },
            notes: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
bookingSchema.index({ user: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ 'resource.resourceId': 1, 'resource.resourceType': 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

bookingSchema.pre<IBooking>('save', function (next) {
    if (!this.tour && !this.lodge && !this.car && !this.customCarRequest && !this.customTrip) {
        throw new Error('A booking must be associated with either a tour, lodge, car, custom trip, or custom car request.');
    }

    // Backward-compatible derivation for the new unified resource/date fields.
    if (!this.resource?.resourceId) {
        if (this.tour) this.resource = { resourceId: this.tour, resourceType: 'Tour' };
        else if (this.lodge) this.resource = { resourceId: this.lodge, resourceType: 'Lodge' };
        else if (this.car) this.resource = { resourceId: this.car, resourceType: 'Car' };
    }

    if (!this.startDate) {
        this.startDate = this.checkInDate || this.bookingDate || new Date();
    }
    if (!this.endDate) {
        this.endDate = this.checkOutDate || this.checkInDate || this.bookingDate || this.startDate;
    }

    next();
});

const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
