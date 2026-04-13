import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICar extends Document {
    name: string;
    brand: string;
    carModel: string;
    year: number;
    transmission: 'Manual' | 'Automatic';
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    seats: number;
    pricePerDay: number;
    images: string[];
    features?: string[];
    available: boolean;
    description: string;
    location: string;
}

const carSchema: Schema<ICar> = new Schema(
    {
        name: { type: String, required: true },
        brand: { type: String, required: true },
        carModel: { type: String, required: true },
        year: { type: Number, required: true },
        transmission: {
            type: String,
            enum: ['Manual', 'Automatic'],
            required: true,
        },
        fuelType: {
            type: String,
            enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
            required: true,
        },
        seats: { type: Number, required: true },
        pricePerDay: { type: Number, required: true },
        images: [{ type: String, required: true }],
        features: [{ type: String }],
        available: { type: Boolean, default: true },
        description: { type: String, required: true },
        location: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

// Indexes
carSchema.index({ brand: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ location: 1 });

const Car: Model<ICar> = mongoose.model<ICar>('Car', carSchema);

export default Car;
