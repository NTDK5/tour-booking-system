import mongoose, { Schema, Document, Model } from 'mongoose';

/** Unified booking status model */
export type BookingLifecycleStatus = 'draft' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
export type LegacyBookingStatus =
    | BookingLifecycleStatus
    | 'pending'
    | 'under_review'
    | 'offer_sent'
    | 'expired'
    | 'refunded'
    | 'submitted'
    | 'offered'
    | 'accepted'
    | 'rejected';

export interface IPricingSnapshot {
    baseAmount: number;
    groupDiscountAmount: number;
    seasonalAdjustmentAmount: number;
    addOnsTotal: number;
    subtotal: number;
    depositAmount: number;
    totalAmount: number;
    currency: string;
    lines?: { label: string; amount: number }[];
    quotedAt?: Date;
    guests?: number;
    children?: number;
    pricingType?: string;
}

export interface IBooking extends Document {
    schemaVersion?: number;
    bookingNumber?: string;
    lifecycleStatus?: BookingLifecycleStatus;
    inventoryPhase?: 'none' | 'reserved' | 'confirmed' | 'released';

    user: mongoose.Types.ObjectId;
    paymentId?: mongoose.Types.ObjectId | string;
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
    status: LegacyBookingStatus;
    paymentMethod: 'credit card' | 'card' | 'paypal' | 'bank transfer' | 'cash';
    notes?: string;
    internalNotes?: string;
    source: 'online' | 'offline';
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    priceOverride?: number;
    proposedPrice?: number;
    offer?: Record<string, unknown>;
    estimateSnapshot?: Record<string, unknown>;
    packagePricingSnapshot?: Record<string, unknown>;
    pricingSnapshot?: IPricingSnapshot;
    departureId?: mongoose.Types.ObjectId;
    selectedAddons?: { name: string; price: number }[];
    addOnLines?: {
        addonKey: string;
        name: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
    }[];
    travelers?: {
        fullName: string;
        travelerType: 'adult' | 'child' | 'infant';
        passportNumber?: string;
        nationality?: string;
        dateOfBirth?: Date;
        gender?: string;
        dietaryRequirements?: string;
        emergencyContact?: { name?: string; phone?: string; email?: string };
    }[];
    paymentLedger?: {
        paymentType: 'deposit' | 'balance' | 'refund' | 'adjustment';
        amount: number;
        currency: string;
        method: string;
        status: 'pending' | 'completed' | 'failed' | 'cancelled';
        transactionReference?: string;
        provider?: 'paypal' | 'stripe' | 'manual' | 'cash' | 'bank_transfer';
        paidAt?: Date;
        stripePaymentIntentId?: string;
        notes?: string;
    }[];
    workflow?: {
        workflowStatus?: string;
        voucherIssued?: boolean;
        documentsSent?: boolean;
        operationsAssigned?: boolean;
    };
    assignedGuide?: mongoose.Types.ObjectId;
    assignedVehicle?: mongoose.Types.ObjectId;
    assignedHotels?: { lodgeId?: mongoose.Types.ObjectId; name?: string; destination?: string }[];
    documents?: {
        voucherUrl?: string;
        invoiceUrl?: string;
        receiptUrls?: string[];
    };
    cancellationDetails?: {
        reason?: string;
        refundAmount?: number;
        cancelledAt?: Date;
        cancelledBy?: mongoose.Types.ObjectId;
    };
    amendmentHistory?: {
        changedFields?: string[];
        reason?: string;
        performedBy?: mongoose.Types.ObjectId;
        at?: Date;
    }[];
    auditTrail?: {
        action: string;
        performedBy?: mongoose.Types.ObjectId;
        timestamp: Date;
        notes?: string;
        metadata?: Record<string, unknown>;
    }[];
    depositAmount?: number;
    isRequest?: boolean;
    customTrip?: mongoose.Types.ObjectId;
    history: { status: string; timestamp: Date; comment?: string }[];
    checkInDate?: Date;
    checkOutDate?: Date;
    roomType?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    customCarRequest?: Record<string, unknown>;
}

const travelerSchema = new Schema(
    {
        fullName: { type: String, required: true, trim: true },
        travelerType: { type: String, enum: ['adult', 'child', 'infant'], default: 'adult' },
        passportNumber: { type: String, trim: true },
        nationality: { type: String, trim: true },
        dateOfBirth: { type: Date },
        gender: { type: String, trim: true },
        dietaryRequirements: { type: String, maxlength: 500 },
        emergencyContact: {
            name: String,
            phone: String,
            email: String,
        },
    },
    { _id: true }
);

const addOnLineSchema = new Schema(
    {
        addonKey: { type: String, required: true },
        name: { type: String, required: true },
        unitPrice: { type: Number, min: 0, required: true },
        quantity: { type: Number, min: 1, default: 1 },
        lineTotal: { type: Number, min: 0, required: true },
    },
    { _id: false }
);

const paymentLedgerEntrySchema = new Schema(
    {
        paymentType: { type: String, enum: ['deposit', 'balance', 'refund', 'adjustment'], required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        method: { type: String, required: true },
        status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
        transactionReference: { type: String, trim: true },
        provider: { type: String, enum: ['paypal', 'stripe', 'manual', 'cash', 'bank_transfer'] },
        paidAt: { type: Date },
        stripePaymentIntentId: { type: String },
        notes: { type: String, maxlength: 500 },
    },
    { _id: true, timestamps: true }
);

const pricingSnapshotSchema = new Schema(
    {
        baseAmount: { type: Number, min: 0, default: 0 },
        groupDiscountAmount: { type: Number, default: 0 },
        seasonalAdjustmentAmount: { type: Number, default: 0 },
        addOnsTotal: { type: Number, min: 0, default: 0 },
        subtotal: { type: Number, min: 0, required: true },
        depositAmount: { type: Number, min: 0, default: 0 },
        totalAmount: { type: Number, min: 0, required: true },
        currency: { type: String, default: 'USD' },
        lines: [{ label: String, amount: Number }],
        quotedAt: { type: Date },
        guests: { type: Number, min: 1 },
        children: { type: Number, min: 0 },
        pricingType: { type: String },
    },
    { _id: false }
);

const workflowSchema = new Schema(
    {
        workflowStatus: { type: String, default: 'intake' },
        voucherIssued: { type: Boolean, default: false },
        documentsSent: { type: Boolean, default: false },
        operationsAssigned: { type: Boolean, default: false },
    },
    { _id: false }
);

const documentsSchema = new Schema(
    {
        voucherUrl: { type: String },
        invoiceUrl: { type: String },
        receiptUrls: [{ type: String }],
    },
    { _id: false }
);

const cancellationSchema = new Schema(
    {
        reason: { type: String, maxlength: 2000 },
        refundAmount: { type: Number, min: 0 },
        cancelledAt: { type: Date },
        cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { _id: false }
);

const amendmentSchema = new Schema(
    {
        changedFields: [{ type: String }],
        reason: { type: String, maxlength: 1000 },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
    },
    { _id: true }
);

const auditTrailSchema = new Schema(
    {
        action: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String, maxlength: 2000 },
        metadata: { type: Schema.Types.Mixed },
    },
    { _id: true }
);

const assignedHotelSchema = new Schema(
    {
        lodgeId: { type: Schema.Types.ObjectId, ref: 'Lodge' },
        name: String,
        destination: String,
    },
    { _id: false }
);

export const bookingSchema = new Schema<IBooking>(
    {
        schemaVersion: { type: Number, default: 2 },
        bookingNumber: { type: String, unique: true, sparse: true, trim: true },
        lifecycleStatus: {
            type: String,
            enum: [
                'draft',
                'pending_payment',
                'confirmed',
                'cancelled',
                'completed',
                'pending',
                'under_review',
                'offer_sent',
                'expired',
                'refunded',
                'submitted',
                'offered',
                'accepted',
                'rejected',
            ],
            default: 'draft',
        },
        inventoryPhase: {
            type: String,
            enum: ['none', 'reserved', 'confirmed', 'released'],
            default: 'none',
        },

        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        paymentId: { type: Schema.Types.Mixed },
        tour: { type: Schema.Types.ObjectId, ref: 'Tour' },
        lodge: { type: Schema.Types.ObjectId, ref: 'Lodge' },
        bookingType: { type: String, enum: ['Tour', 'Lodge', 'Car'], required: true },
        bookingDate: { type: Date, required: true, default: Date.now },
        numberOfPeople: { type: Number, required: true, min: 1 },
        totalPrice: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ['draft', 'pending_payment', 'confirmed', 'cancelled', 'completed'],
            default: 'draft',
        },
        paymentMethod: {
            type: String,
            enum: ['credit card', 'card', 'paypal', 'bank transfer', 'cash'],
            required: true,
        },
        notes: { type: String, maxlength: 500 },
        internalNotes: { type: String, maxlength: 1000 },
        source: { type: String, enum: ['online', 'offline'], default: 'online' },
        paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
        priceOverride: { type: Number, min: 0 },
        proposedPrice: { type: Number, min: 0 },
        offer: { type: Schema.Types.Mixed },
        estimateSnapshot: { type: Schema.Types.Mixed },
        packagePricingSnapshot: { type: Schema.Types.Mixed },
        pricingSnapshot: pricingSnapshotSchema,

        departureId: { type: Schema.Types.ObjectId, ref: 'PackageDeparture' },
        selectedAddons: [{ name: String, price: { type: Number, min: 0 } }],
        addOnLines: [addOnLineSchema],
        travelers: [travelerSchema],
        paymentLedger: [paymentLedgerEntrySchema],

        workflow: workflowSchema,
        assignedGuide: { type: Schema.Types.ObjectId, ref: 'Resource' },
        assignedVehicle: { type: Schema.Types.ObjectId, ref: 'Car' },
        assignedHotels: [assignedHotelSchema],
        documents: documentsSchema,
        cancellationDetails: cancellationSchema,
        amendmentHistory: [amendmentSchema],
        auditTrail: [auditTrailSchema],

        depositAmount: { type: Number, min: 0 },
        isRequest: { type: Boolean, default: false },
        customTrip: { type: Schema.Types.ObjectId, ref: 'CustomTrip' },
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
        car: { type: Schema.Types.ObjectId, ref: 'Car' },
        resource: {
            resourceId: { type: Schema.Types.ObjectId, ref: 'Resource' },
            resourceType: { type: String, enum: ['Lodge', 'Tour', 'Car', 'Guide', 'Service'] },
        },
        startDate: { type: Date },
        endDate: { type: Date },
        pickupLocation: { type: String },
        dropoffLocation: { type: String },
        customCarRequest: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

bookingSchema.index({ user: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ lifecycleStatus: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ bookingNumber: 1 }, { unique: true, sparse: true });
bookingSchema.index({ 'resource.resourceId': 1, 'resource.resourceType': 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ departureId: 1 });

bookingSchema.pre('save', function (next) {
    const doc = this as unknown as IBooking;
    const hasCustomCar = !!doc.customCarRequest;
    if (!doc.tour && !doc.lodge && !doc.car && !doc.customTrip && !hasCustomCar) {
        return next(new Error('A booking must be associated with either a tour, lodge, car, custom trip, or custom car request.'));
    }

    if (!doc.resource?.resourceId) {
        if (doc.tour) doc.resource = { resourceId: doc.tour, resourceType: 'Tour' };
        else if (doc.lodge) doc.resource = { resourceId: doc.lodge, resourceType: 'Lodge' };
        else if (doc.car) doc.resource = { resourceId: doc.car, resourceType: 'Car' };
    }

    if (!doc.startDate) {
        doc.startDate = doc.checkInDate || doc.bookingDate || new Date();
    }
    if (!doc.endDate) {
        doc.endDate = doc.checkOutDate || doc.checkInDate || doc.bookingDate || doc.startDate;
    }

    next();
});

export const createBookingModel = (): Model<IBooking> => {
    if (mongoose.models.Booking) {
        return mongoose.model<IBooking>('Booking');
    }
    return mongoose.model<IBooking>('Booking', bookingSchema);
};
