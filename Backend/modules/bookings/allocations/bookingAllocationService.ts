import mongoose from 'mongoose';
import type { IBooking } from '../models/bookingSchema';
import { appendBookingAudit } from '../audit/bookingAuditService';

export async function assignGuide(
    booking: IBooking,
    guideId: mongoose.Types.ObjectId,
    performedBy?: mongoose.Types.ObjectId
): Promise<void> {
    booking.assignedGuide = guideId;
    booking.workflow = booking.workflow || {};
    booking.workflow.operationsAssigned = true;
    await appendBookingAudit(booking, {
        action: 'allocation_guide',
        performedBy,
        metadata: { guideId: String(guideId) },
    });
}

export async function assignVehicle(
    booking: IBooking,
    vehicleId: mongoose.Types.ObjectId,
    performedBy?: mongoose.Types.ObjectId
): Promise<void> {
    booking.assignedVehicle = vehicleId;
    booking.workflow = booking.workflow || {};
    booking.workflow.operationsAssigned = true;
    await appendBookingAudit(booking, {
        action: 'allocation_vehicle',
        performedBy,
        metadata: { vehicleId: String(vehicleId) },
    });
}

export async function setAssignedHotels(
    booking: IBooking,
    hotels: { lodgeId?: mongoose.Types.ObjectId; name?: string; destination?: string }[],
    performedBy?: mongoose.Types.ObjectId
): Promise<void> {
    booking.assignedHotels = hotels;
    await appendBookingAudit(booking, {
        action: 'allocation_hotels',
        performedBy,
        metadata: { count: hotels.length },
    });
}
