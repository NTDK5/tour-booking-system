import mongoose from 'mongoose';
import type { IBooking } from '../models/bookingSchema';
import { createAuditLog } from '../../../utils/auditLogger';

export async function appendBookingAudit(
    booking: IBooking,
    params: {
        action: string;
        performedBy?: mongoose.Types.ObjectId;
        notes?: string;
        metadata?: Record<string, unknown>;
    }
): Promise<void> {
    if (!booking.auditTrail) booking.auditTrail = [];
    booking.auditTrail.push({
        action: params.action,
        performedBy: params.performedBy,
        timestamp: new Date(),
        notes: params.notes,
        metadata: params.metadata,
    });

    await createAuditLog({
        user: params.performedBy,
        action: params.action,
        actionType: 'BOOKING',
        resource: 'Booking',
        resourceId: String(booking._id),
        details: params.notes,
        metadata: {
            bookingNumber: booking.bookingNumber,
            ...params.metadata,
        },
        actorRole: params.performedBy ? 'admin' : 'system',
    });
}
