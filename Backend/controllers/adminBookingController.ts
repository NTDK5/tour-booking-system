import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Booking from '../models/bookingModel';
import { ApiError } from '../utils/ApiError';
import { toAdminBookingDTO } from '../modules/bookings/dto/bookingDto';
import { appendLedgerEntry } from '../modules/bookings/payments/bookingPaymentService';
import { cancelBookingWorkflow, confirmBookingWorkflow, markCompleted, markInProgress } from '../modules/bookings/workflow/bookingWorkflowService';
import {
    assignGuide,
    assignVehicle,
    setAssignedHotels,
} from '../modules/bookings/allocations/bookingAllocationService';
import { appendBookingAudit } from '../modules/bookings/audit/bookingAuditService';

export const adminListBookings = asyncHandler(async (req: any, res: any) => {
    const { lifecycleStatus, workflowStatus, search } = req.query as Record<string, string | undefined>;

    const filter: Record<string, unknown> = {};
    if (lifecycleStatus) filter.lifecycleStatus = lifecycleStatus;
    if (workflowStatus) {
        filter['workflow.workflowStatus'] = workflowStatus;
    }
    if (search?.trim()) {
        filter.$or = [
            { bookingNumber: new RegExp(search.trim(), 'i') },
            { notes: new RegExp(search.trim(), 'i') },
        ];
    }

    const bookings = await Booking.find(filter)
        .populate('user', 'first_name last_name email')
        .populate('tour', 'title destination')
        .populate('lodge', 'name location')
        .populate('car', 'brand model')
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();

    res.status(200).json(bookings.map((b) => toAdminBookingDTO(b as any)));
});

export const adminGetBooking = asyncHandler(async (req: any, res: any) => {
    const booking = await Booking.findById(req.params.id)
        .populate('user', 'first_name last_name email phone')
        .populate('tour')
        .populate('lodge')
        .populate('car')
        .populate('departureId')
        .populate('assignedGuide')
        .populate('assignedVehicle');

    if (!booking) {
        throw new ApiError(404, 'Booking not found');
    }

    res.status(200).json(toAdminBookingDTO(booking));
});

export const adminConfirmBooking = asyncHandler(async (req: any, res: any) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    await confirmBookingWorkflow(booking, req.user?._id);
    await booking.save();

    res.status(200).json(toAdminBookingDTO(booking));
});

export const adminRecordManualPayment = asyncHandler(async (req: any, res: any) => {
    const { amount, method, notes } = req.body as {
        amount: number;
        method?: string;
        notes?: string;
    };

    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    appendLedgerEntry(booking, {
        paymentType: 'balance',
        amount: Number(amount),
        currency: booking.pricingSnapshot?.currency || 'USD',
        method: method || 'manual',
        status: 'completed',
        provider: 'manual',
        notes,
    });

    await booking.save();
    res.status(200).json(toAdminBookingDTO(booking));
});

export const adminPatchAllocation = asyncHandler(async (req: any, res: any) => {
    const { guideId, vehicleId, hotels } = req.body as {
        guideId?: string;
        vehicleId?: string;
        hotels?: { lodgeId?: string; name?: string; destination?: string }[];
    };

    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (guideId) await assignGuide(booking, new mongoose.Types.ObjectId(guideId), req.user?._id);
    if (vehicleId) await assignVehicle(booking, new mongoose.Types.ObjectId(vehicleId), req.user?._id);
    if (hotels && Array.isArray(hotels)) {
        await setAssignedHotels(
            booking,
            hotels.map((h) => ({
                lodgeId: h.lodgeId ? new mongoose.Types.ObjectId(h.lodgeId) : undefined,
                name: h.name,
                destination: h.destination,
            })),
            req.user?._id
        );
    }

    await booking.save();
    res.status(200).json(toAdminBookingDTO(booking));
});

export const adminIssueVoucherStub = asyncHandler(async (req: any, res: any) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    const stubUrl = `/api/bookings/${booking._id}/documents/voucher`;
    booking.documents = booking.documents || {};
    booking.documents.voucherUrl = stubUrl;
    booking.workflow = booking.workflow || {};
    booking.workflow.voucherIssued = true;

    await booking.save();
    res.status(200).json(toAdminBookingDTO(booking));
});

export const adminCancelBooking = asyncHandler(async (req: any, res: any) => {
    const { reason, refundAmount } = req.body as { reason?: string; refundAmount?: number };

    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    await cancelBookingWorkflow(booking, {
        reason,
        refundAmount,
        performedBy: req.user?._id,
    });

    await booking.save();
    res.status(200).json(toAdminBookingDTO(booking));
});

export const adminUpdateBookingStatus = asyncHandler(async (req: any, res: any) => {
    const { lifecycleStatus, reason, refundAmount } = req.body as {
        lifecycleStatus: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
        reason?: string;
        refundAmount?: number;
    };

    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (!lifecycleStatus) {
        throw new ApiError(400, 'lifecycleStatus is required');
    }

    if (lifecycleStatus === 'cancelled') {
        await cancelBookingWorkflow(booking, {
            reason,
            refundAmount,
            performedBy: req.user?._id,
        });
    } else if (lifecycleStatus === 'confirmed') {
        await confirmBookingWorkflow(booking, req.user?._id);
    } else if (lifecycleStatus === 'in_progress') {
        await markInProgress(booking, req.user?._id);
    } else if (lifecycleStatus === 'completed') {
        await markCompleted(booking, req.user?._id);
    } else if (lifecycleStatus === 'pending') {
        booking.lifecycleStatus = 'pending';
        booking.status = 'pending' as any;
        await appendBookingAudit(booking as any, {
            action: 'booking_pending',
            performedBy: req.user?._id,
            notes: 'Booking moved to pending by admin',
        });
    }

    await booking.save();
    res.status(200).json(toAdminBookingDTO(booking));
});
