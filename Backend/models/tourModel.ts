import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITour extends Document {
    title: string;
    description: string;
    destination: string;
    price: number;
    duration: string;
    imageUrl: string[];
    itinerary: {
        day: number;
        activities: {
            time?: string;
            activity: string;
        }[];
    }[];
    averageRating: number;
    totalRatings: number;
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}

const tourSchema: Schema<ITour> = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        destination: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: String, required: true },
        imageUrl: [{ type: String }],
        itinerary: [
            {
                day: { type: Number, required: true },
                activities: [
                    {
                        time: String,
                        activity: { type: String, required: true },
                    },
                ],
            },
        ],
        averageRating: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 },
        category: { type: String },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    },
    {
        timestamps: true,
    }
);

// Indexes
tourSchema.index({ category: 1 });
tourSchema.index({ difficulty: 1 });
tourSchema.index({ averageRating: -1 });
tourSchema.index({ price: 1 });
tourSchema.index({ destination: 1 });

const Tour: Model<ITour> = mongoose.model<ITour>('Tour', tourSchema);

export default Tour;
