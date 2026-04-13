import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IItinerary extends Document {
    destination: mongoose.Types.ObjectId;
    title: string;
    summary: string;
    activities: mongoose.Types.ObjectId[];
    dayType: 'culture' | 'adventure' | 'nature' | 'historical' | 'mixed';
    durationHours: number;
    price: number;
    isPopular: boolean;
    isActive: boolean;
}

const itinerarySchema: Schema<IItinerary> = new Schema(
    {
        destination: {
            type: Schema.Types.ObjectId,
            ref: 'Destination',
            required: true,
        },
        title: { type: String, required: true, trim: true },
        summary: { type: String, required: true },
        activities: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Activity',
                required: true,
            },
        ],
        dayType: {
            type: String,
            enum: ['culture', 'adventure', 'nature', 'historical', 'mixed'],
            default: 'mixed',
        },
        durationHours: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        isPopular: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

itinerarySchema.index({ destination: 1 });
itinerarySchema.index({ isActive: 1 });
itinerarySchema.index({ isPopular: 1 });

const Itinerary: Model<IItinerary> = mongoose.model<IItinerary>('Itinerary', itinerarySchema);

export default Itinerary;
