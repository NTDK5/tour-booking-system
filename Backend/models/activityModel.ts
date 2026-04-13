import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IActivity extends Document {
    title: string;
    description: string;
    category: 'culture' | 'nature' | 'adventure' | 'historical' | 'other';
    duration: string;
    destination: mongoose.Types.ObjectId;
    isActive: boolean;
}

const activitySchema: Schema<IActivity> = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        category: {
            type: String,
            enum: ['culture', 'nature', 'adventure', 'historical', 'other'],
            default: 'other',
        },
        duration: { type: String, required: true },
        destination: {
            type: Schema.Types.ObjectId,
            ref: 'Destination',
            required: true,
        },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

activitySchema.index({ category: 1 });
activitySchema.index({ destination: 1 });

const Activity: Model<IActivity> = mongoose.model<IActivity>('Activity', activitySchema);

export default Activity;
