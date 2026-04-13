import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILodge extends Document {
    name: string;
    location: string;
    roomTypes: {
        type: string;
        price: number;
        amenities: string[];
        availableRooms: number;
    }[];
    description?: string;
    amenities: string[];
    images: string[];
    contactInfo?: {
        phone?: string;
        email?: string;
    };
}

const lodgeSchema: Schema<ILodge> = new Schema({
    name: { type: String, default: 'Dorze Lodge' },
    location: { type: String, default: 'Dorze, Ethiopia' },
    roomTypes: [
        {
            type: { type: String, required: true },
            price: { type: Number, required: true },
            amenities: { type: [String], required: true },
            availableRooms: { type: Number, required: true },
        },
    ],
    description: { type: String },
    amenities: { type: [String], default: [] },
    images: [String],
    contactInfo: {
        phone: String,
        email: String,
    },
},
    {
        timestamps: true,
    }
);

// Indexes
lodgeSchema.index({ location: 1 });
lodgeSchema.index({ name: 1 });

const Lodge: Model<ILodge> = mongoose.model<ILodge>('Lodge', lodgeSchema);

export default Lodge;
