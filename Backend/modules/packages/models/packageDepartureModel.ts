import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPackageDeparture extends Document {
    packageId: mongoose.Types.ObjectId;
    startsAt: Date;
    endsAt?: Date;
    capacity: number;
    bookedCount: number;
    status: 'scheduled' | 'open' | 'full' | 'cancelled';
    sku?: string;
    notes?: string;
}

const packageDepartureSchema = new Schema<IPackageDeparture>(
    {
        packageId: {
            type: Schema.Types.ObjectId,
            ref: 'Tour',
            required: true,
            index: true,
        },
        startsAt: { type: Date, required: true },
        endsAt: Date,
        capacity: { type: Number, required: true, min: 1 },
        bookedCount: { type: Number, default: 0, min: 0 },
        status: {
            type: String,
            enum: ['scheduled', 'open', 'full', 'cancelled'],
            default: 'open',
        },
        sku: String,
        notes: { type: String, maxlength: 500 },
    },
    { timestamps: true }
);

packageDepartureSchema.index({ packageId: 1, startsAt: 1 });

const PackageDeparture: Model<IPackageDeparture> =
    mongoose.models.PackageDeparture ||
    mongoose.model<IPackageDeparture>('PackageDeparture', packageDepartureSchema, 'packageDepartures');

export default PackageDeparture;
