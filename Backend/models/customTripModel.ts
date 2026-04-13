import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICustomTrip extends Document {
    user: mongoose.Types.ObjectId;
    days: number;
    itinerary: {
        day: number;
        destination?: mongoose.Types.ObjectId;
        itineraryItem?: mongoose.Types.ObjectId;
        options: mongoose.Types.ObjectId[];
        notes?: string;
    }[];
    estimatedBudget?: number;
    mode?: 'budget' | 'premium';
    templateName?: string;
    pricingBreakdown?: {
        basePerDay: number;
        daysCost: number;
        optionsCost: number;
        modeMultiplier: number;
        subtotal: number;
        finalTotal: number;
    };
    finalPrice?: number;
    notes?: string;
}

const customTripSchema: Schema<ICustomTrip> = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        days: { type: Number, required: true, min: 1 },
        itinerary: [
            {
                day: { type: Number, required: true },
                destination: {
                    type: Schema.Types.ObjectId,
                    ref: 'Destination'
                },
                itineraryItem: {
                    type: Schema.Types.ObjectId,
                    ref: 'Itinerary'
                },
                options: [{
                    type: Schema.Types.ObjectId,
                    ref: 'CustomTripOption'
                }],
                notes: { type: String }
            }
        ],
        estimatedBudget: { type: Number },
        mode: { type: String, enum: ['budget', 'premium'], default: 'budget' },
        templateName: { type: String },
        pricingBreakdown: {
            basePerDay: { type: Number },
            daysCost: { type: Number },
            optionsCost: { type: Number },
            modeMultiplier: { type: Number },
            subtotal: { type: Number },
            finalTotal: { type: Number }
        },
        finalPrice: { type: Number },
        notes: { type: String, maxlength: 1000 }
    },
    {
        timestamps: true,
    }
);

const CustomTrip: Model<ICustomTrip> = mongoose.model<ICustomTrip>('CustomTrip', customTripSchema);

export default CustomTrip;
