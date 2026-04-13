import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    tour?: mongoose.Types.ObjectId;
    lodge?: mongoose.Types.ObjectId;
    car?: mongoose.Types.ObjectId;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    tour: {
        type: Schema.Types.ObjectId,
        ref: 'Tour'
    },
    lodge: {
        type: Schema.Types.ObjectId,
        ref: 'Lodge'
    },
    car: {
        type: Schema.Types.ObjectId,
        ref: 'Car'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    images: [{
        type: String
    }]
}, {
    timestamps: true
});

// Prevent multiple reviews from same user for same resource
ReviewSchema.index({ user: 1, tour: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ user: 1, lodge: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ user: 1, car: 1 }, { unique: true, sparse: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
