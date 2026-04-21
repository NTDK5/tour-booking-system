import mongoose, { Document, Model, Schema } from 'mongoose';

export type AssignmentRole = 'guide' | 'driver';
export type AssignmentStatus = 'active' | 'cancelled';

export interface IAssignment extends Document {
    staffId: mongoose.Types.ObjectId;
    role: AssignmentRole;
    departureId: mongoose.Types.ObjectId;
    bookingId?: mongoose.Types.ObjectId;
    customTripId?: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: AssignmentStatus;
    assignedBy?: mongoose.Types.ObjectId;
    cancelledBy?: mongoose.Types.ObjectId;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
    {
        staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
        role: { type: String, enum: ['guide', 'driver'], required: true, index: true },
        departureId: {
            type: Schema.Types.ObjectId,
            ref: 'PackageDeparture',
            required: true,
            index: true,
        },
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
        customTripId: { type: Schema.Types.ObjectId, ref: 'CustomTrip' },
        startDate: { type: Date, required: true, index: true },
        endDate: { type: Date, required: true, index: true },
        status: { type: String, enum: ['active', 'cancelled'], default: 'active', index: true },
        assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
        cancellationReason: { type: String, maxlength: 500 },
    },
    { timestamps: true }
);

assignmentSchema.index({ staffId: 1, status: 1, startDate: 1, endDate: 1 });
assignmentSchema.index({ departureId: 1, role: 1, status: 1 });

const Assignment: Model<IAssignment> =
    mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', assignmentSchema, 'assignments');

export default Assignment;
