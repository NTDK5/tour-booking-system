import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBooking extends Document {
    user: mongoose.Types.ObjectId;
    paymentId?: mongoose.Types.ObjectId | string; // Can be ref or direct string from gateway
    tour?: mongoose.Types.ObjectId;
    lodge?: mongoose.Types.ObjectId;
    car?: mongoose.Types.ObjectId;
    bookingType: 'Tour' | 'Lodge' | 'Car';
    bookingDate: Date;
    numberOfPeople: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'refunded' | 'submitted' | 'offered' | 'accepted' | 'rejected';
    paymentMethod: 'credit card' | 'card' | 'paypal' | 'bank transfer' | 'cash';
    notes?: string;
    internalNotes?: string;
    source: 'online' | 'offline';
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    priceOverride?: number;
    proposedPrice?: number;
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
            enum: ['pending', 'confirmed', 'cancelled', 'expired', 'refunded', 'submitted', 'offered', 'accepted', 'rejected'],
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

bookingSchema.pre<IBooking>('save', function (next) {
    if (!this.tour && !this.lodge && !this.car && !this.customCarRequest && !this.customTrip) {
        throw new Error('A booking must be associated with either a tour, lodge, car, custom trip, or custom car request.');
    }
    next();
});

const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
