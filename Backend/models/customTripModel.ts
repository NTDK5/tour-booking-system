import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICustomTrip extends Document {
    user: mongoose.Types.ObjectId;
    days: number;
    itinerary: {
        day: number;
        tripDate?: Date;
        destination?: mongoose.Types.ObjectId;
        itineraryItem?: mongoose.Types.ObjectId;
        activities: mongoose.Types.ObjectId[];
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
    originalItinerary?: {
        day: number;
        tripDate?: Date;
        destination?: mongoose.Types.ObjectId;
        itineraryItem?: mongoose.Types.ObjectId;
        activities: mongoose.Types.ObjectId[];
        options: mongoose.Types.ObjectId[];
        notes?: string;
    }[];
    reviewedItinerary?: {
        day: number;
        tripDate?: Date;
        destination?: mongoose.Types.ObjectId;
        itineraryItem?: mongoose.Types.ObjectId;
        activities: mongoose.Types.ObjectId[];
        options: mongoose.Types.ObjectId[];
        notes?: string;
    }[];
    changeSummary?: {
        field: string;
        previousValue?: string;
        newValue?: string;
        reason: string;
        changedBy?: mongoose.Types.ObjectId;
        changedAt?: Date;
    }[];
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
                tripDate: { type: Date },
                destination: {
                    type: Schema.Types.ObjectId,
                    ref: 'Destination'
                },
                itineraryItem: {
                    type: Schema.Types.ObjectId,
                    ref: 'Itinerary'
                },
                activities: [{
                    type: Schema.Types.ObjectId,
                    ref: 'Activity'
                }],
                options: [{
                    type: Schema.Types.ObjectId,
                    ref: 'CustomTripOption'
                }],
                notes: { type: String }
            }
        ],
        originalItinerary: [
            {
                day: { type: Number, required: true },
                tripDate: { type: Date },
                destination: { type: Schema.Types.ObjectId, ref: 'Destination' },
                itineraryItem: { type: Schema.Types.ObjectId, ref: 'Itinerary' },
                activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
                options: [{ type: Schema.Types.ObjectId, ref: 'CustomTripOption' }],
                notes: { type: String }
            }
        ],
        reviewedItinerary: [
            {
                day: { type: Number, required: true },
                tripDate: { type: Date },
                destination: { type: Schema.Types.ObjectId, ref: 'Destination' },
                itineraryItem: { type: Schema.Types.ObjectId, ref: 'Itinerary' },
                activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
                options: [{ type: Schema.Types.ObjectId, ref: 'CustomTripOption' }],
                notes: { type: String }
            }
        ],
        changeSummary: [
            {
                field: { type: String, required: true },
                previousValue: { type: String },
                newValue: { type: String },
                reason: { type: String, required: true },
                changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
                changedAt: { type: Date, default: Date.now }
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
