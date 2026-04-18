import mongoose from 'mongoose';
import type { IBooking } from '../models/bookingSchema';
import {
    cancelReservedSeats,
    confirmDepartureSeats,
    releaseConfirmedSeats,
} from '../services/bookingInventoryService';
import { appendBookingAudit } from '../audit/bookingAuditService';

/** Align legacy `status` with enterprise lifecycle where applicable */
function syncLegacyStatus(booking: IBooking, legacy: string) {
    booking.status = legacy as any;
}

/** Admin/ops: confirm booking — moves departure seats reserved → confirmed when applicable */
export async function confirmBookingWorkflow(
    booking: IBooking,
    performedBy?: mongoose.Types.ObjectId,
    session?: mongoose.ClientSession | null
): Promise<void> {
    if (booking.lifecycleStatus === 'cancelled') {
        throw new Error('Cannot confirm a cancelled booking');
    }

    booking.lifecycleStatus = 'confirmed';
    syncLegacyStatus(booking, 'confirmed');

    if (booking.departureId && booking.inventoryPhase === 'reserved') {
        await confirmDepartureSeats(booking.departureId, booking.numberOfPeople, session ?? undefined);
        booking.inventoryPhase = 'confirmed';
    }

    booking.workflow = booking.workflow || {};
    booking.workflow.workflowStatus = booking.workflow.workflowStatus || 'confirmed';

    await appendBookingAudit(booking, {
        action: 'booking_confirmed',
        performedBy,
        notes: 'Booking lifecycle confirmed',
    });
}

export async function cancelBookingWorkflow(
    booking: IBooking,
    params: {
        reason?: string;
        refundAmount?: number;
        performedBy?: mongoose.Types.ObjectId;
        session?: mongoose.ClientSession | null;
    }
): Promise<void> {
    const session = params.session ?? undefined;

    if (booking.departureId) {
        if (booking.inventoryPhase === 'reserved') {
            await cancelReservedSeats(booking.departureId, booking.numberOfPeople, session);
        } else if (booking.inventoryPhase === 'confirmed') {
            await releaseConfirmedSeats(booking.departureId, booking.numberOfPeople, session);
        }
    }

    booking.lifecycleStatus = 'cancelled';
    syncLegacyStatus(booking, 'cancelled');
    booking.inventoryPhase = 'released';

    booking.cancellationDetails = {
        ...(booking.cancellationDetails || {}),
        reason: params.reason,
        refundAmount: params.refundAmount,
        cancelledAt: new Date(),
        cancelledBy: params.performedBy,
    };

    await appendBookingAudit(booking, {
        action: 'booking_cancelled',
        performedBy: params.performedBy,
        notes: params.reason,
        metadata: { refundAmount: params.refundAmount },
    });
}

export async function markInProgress(booking: IBooking, performedBy?: mongoose.Types.ObjectId): Promise<void> {
    booking.lifecycleStatus = 'in_progress';
    await appendBookingAudit(booking, {
        action: 'booking_in_progress',
        performedBy,
    });
}

export async function markCompleted(booking: IBooking, performedBy?: mongoose.Types.ObjectId): Promise<void> {
    booking.lifecycleStatus = 'completed';
    syncLegacyStatus(booking, 'confirmed');
    await appendBookingAudit(booking, {
        action: 'booking_completed',
        performedBy,
    });
}
