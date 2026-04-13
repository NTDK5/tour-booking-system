import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPayment extends Document {
    amount: number;
    currency: string;
    booking: mongoose.Types.ObjectId;
    txRef: string;
    status: 'pending' | 'completed' | 'failed';
    provider: 'paypal' | 'stripe';
    stripePaymentIntentId?: string;
    transactionId?: string; // For PayPal
}

const paymentSchema: Schema<IPayment> = new Schema(
    {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        booking: {
            type: Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        txRef: { type: String, required: true, unique: true },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        provider: {
            type: String,
            enum: ['paypal', 'stripe'],
            default: 'paypal',
        },
        stripePaymentIntentId: { type: String },
        transactionId: { type: String },
    },
    {
        timestamps: true,
    }
);

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
