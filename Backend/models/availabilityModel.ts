import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAvailability extends Document {
    resourceId: mongoose.Types.ObjectId;
    resourceType: 'Lodge' | 'Tour' | 'Car';
    date: Date;
    status: 'available' | 'blocked' | 'maintenance' | 'fully_booked';
    bookedCapacity: number;
    totalCapacity: number;
    notes?: string;
}

const availabilitySchema: Schema<IAvailability> = new Schema(
    {
        resourceId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'resourceType',
        },
        resourceType: {
            type: String,
            required: true,
            enum: ['Lodge', 'Tour', 'Car'],
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['available', 'blocked', 'maintenance', 'fully_booked'],
            default: 'available',
        },
        bookedCapacity: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalCapacity: {
            type: Number,
            required: true,
            min: 1,
        },
        notes: {
            type: String,
            maxlength: 200,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient lookup
availabilitySchema.index({ resourceId: 1, resourceType: 1, date: 1 }, { unique: true });

const Availability: Model<IAvailability> = mongoose.model<IAvailability>(
    'Availability',
    availabilitySchema
);

export default Availability;
