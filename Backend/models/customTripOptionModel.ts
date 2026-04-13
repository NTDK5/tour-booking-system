import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICustomTripOption extends Document {
    name: string;
    type: 'Destination' | 'Activity' | 'Tourist Site';
    description: string;
    basePrice: number;
    imageUrl?: string;
    available: boolean;
}

const customTripOptionSchema: Schema<ICustomTripOption> = new Schema(
    {
        name: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ['Destination', 'Activity', 'Tourist Site'],
            required: true,
        },
        description: { type: String, required: true },
        basePrice: { type: Number, required: true, default: 0 },
        imageUrl: { type: String },
        available: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

customTripOptionSchema.index({ type: 1 });
customTripOptionSchema.index({ available: 1 });

const CustomTripOption: Model<ICustomTripOption> = mongoose.model<ICustomTripOption>(
    'CustomTripOption',
    customTripOptionSchema
);

export default CustomTripOption;
