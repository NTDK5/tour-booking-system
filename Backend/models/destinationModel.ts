import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDestination extends Document {
    name: string;
    description: string;
    region: string;
    basePricePerDay: number;
    transportSurcharge: number;
    recommendedDays: number;
    destinationType: 'culture' | 'nature' | 'adventure' | 'historical' | 'mixed';
    images: string[];
    isActive: boolean;
}

const destinationSchema: Schema<IDestination> = new Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        region: { type: String, required: true },
        basePricePerDay: { type: Number, required: true, min: 0, default: 100 },
        transportSurcharge: { type: Number, required: true, min: 0, default: 0 },
        recommendedDays: { type: Number, required: true, min: 1, default: 1 },
        destinationType: {
            type: String,
            enum: ['culture', 'nature', 'adventure', 'historical', 'mixed'],
            default: 'mixed'
        },
        images: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

destinationSchema.index({ name: 1 });
destinationSchema.index({ region: 1 });

const Destination: Model<IDestination> = mongoose.model<IDestination>('Destination', destinationSchema);

export default Destination;
