import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import cron from 'node-cron';
import mongoose from 'mongoose';
import Booking from '../models/bookingModel';
import Tour from '../models/tourModel';
import Lodge from '../models/lodgeModel';
import logger from '../utils/logger';
import { sendEmail } from '../utils/email';
import { AuthRequest } from '../middleware/authMiddleware';
import Availability from '../models/availabilityModel';
import { eachDayOfInterval, startOfDay } from 'date-fns';
import { createAuditLog } from '../utils/auditLogger';
import Log from '../models/logModel';
import CustomTrip from '../models/customTripModel';
import { checkResourceAvailability } from '../services/resourceAvailabilityService';
import { buildAllocationPlaceholder } from '../modules/packages/services/resourceAllocationService';
import { createBookingTransactional } from '../modules/bookings/services/bookingCreationService';
import { ApiError } from '../utils/ApiError';
import Stripe from 'stripe';
import Payment from '../models/paymentModel';
import { derivePaymentTotals } from '../modules/bookings/payments/bookingPaymentService';
import { paymentSummaryFromBooking } from '../modules/bookings/dto/bookingDto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia' as any,
});

// Explicit Statuses
export enum BookingStatus {
    PENDING = 'pending',
    UNDER_REVIEW = 'under_review',
    OFFER_SENT = 'offer_sent',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
    REFUNDED = 'refunded',
    SUBMITTED = 'submitted',
    OFFERED = 'offered',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

const STATUS_ALIAS_TO_CANONICAL: Record<string, string> = {
    submitted: BookingStatus.UNDER_REVIEW,
    offered: BookingStatus.OFFER_SENT,
    accepted: BookingStatus.CONFIRMED,
};

const normalizeInputStatus = (status?: string) => {
    if (!status) return status;
    return STATUS_ALIAS_TO_CANONICAL[status] || status;
};

const canonicalStatusForOutput = (status?: string) => {
    if (!status) return status;
    return STATUS_ALIAS_TO_CANONICAL[status] || status;
};

const toSerializableBooking = (booking: any) => {
    const plain = booking?.toObject ? booking.toObject() : booking;
    const canonicalStatus = canonicalStatusForOutput(plain?.status);
    if (canonicalStatus && canonicalStatus !== plain?.status) {
        return {
            ...plain,
            status: canonicalStatus,
            legacyStatus: plain.status,
        };
    }
    return plain;
};

// Helper to update availability
const updateAvailabilityAfterBooking = async (booking: any, session?: any) => {
    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING) {
        return;
    }

    let dates: Date[] = [];
    if (booking.bookingType === 'Tour' || booking.bookingType === 'tour') {
        dates = [startOfDay(new Date(booking.bookingDate))];
    } else if (booking.checkInDate && booking.checkOutDate) {
        dates = eachDayOfInterval({
            start: startOfDay(new Date(booking.checkInDate)),
            end: startOfDay(new Date(booking.checkOutDate))
        });
        // For lodges/cars, we usually don't count the checkout day as booked
        if (dates.length > 1) dates.pop();
    }

    const resourceId = booking.tour || booking.lodge || booking.car;
    const resourceType = booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1);

    for (const date of dates) {
        await Availability.findOneAndUpdate(
            { resourceId, resourceType, date },
            {
                $inc: { bookedCapacity: booking.numberOfPeople || 1 },
                $setOnInsert: { totalCapacity: 20, status: 'available' } // Default totalCapacity
            },
            { upsert: true, session }
        );
    }
};

const getBookingDates = (booking: any): Date[] => {
    if (booking.bookingType === 'Tour' || booking.bookingType === 'tour') {
        return booking.bookingDate ? [startOfDay(new Date(booking.bookingDate))] : [];
    }
    if (booking.checkInDate && booking.checkOutDate) {
        const dates = eachDayOfInterval({
            start: startOfDay(new Date(booking.checkInDate)),
            end: startOfDay(new Date(booking.checkOutDate))
        });
        if (dates.length > 1) dates.pop();
        return dates;
    }
    return [];
};

const checkResourceConflicts = async (booking: any) => {
    const resourceId = booking.tour || booking.lodge || booking.car;
    if (!resourceId) {
        return { hasConflict: false, conflicts: [] as string[] };
    }

    const resourceType = booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1);
    const dates = getBookingDates(booking);
    if (!dates.length) {
        return { hasConflict: false, conflicts: [] as string[] };
    }

    const conflicts: string[] = [];
    for (const date of dates) {
        const availability = await Availability.findOne({
            resourceId,
            resourceType,
            date: startOfDay(date),
        }).lean();

        if (!availability) continue;

        const projectedBooked = (availability.bookedCapacity || 0) + (booking.numberOfPeople || 1);
        if (availability.status === 'blocked' || availability.status === 'maintenance' || availability.status === 'fully_booked') {
            conflicts.push(`${resourceType} unavailable on ${date.toISOString().slice(0, 10)}`);
        } else if (projectedBooked > (availability.totalCapacity || 1)) {
            conflicts.push(`${resourceType} capacity exceeded on ${date.toISOString().slice(0, 10)}`);
        }
    }

    return { hasConflict: conflicts.length > 0, conflicts };
};

// @desc Create a new booking
// @route POST /api/bookings
// @access Private
export const createBooking = asyncHandler(async (req: any, res: any) => {
    const { bookingType, isRequest = false, customCarRequest } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let booking;
        try {
            booking = await createBookingTransactional(req, session);
        } catch (err: any) {
            if (err instanceof ApiError) {
                res.status(err.statusCode);
            }
            throw err;
        }

        const bookingTypeNormalized = String(bookingType || '').toLowerCase();
        const bookingTypeForStorage = booking.bookingType as string;
        const totalPrice = booking.totalPrice;

        // Fill unified resource/date fields for compatibility and unified calendar.
        const resourceId = booking.tour || booking.lodge || booking.car;
        if (resourceId) {
            booking.resource = {
                resourceId,
                resourceType: bookingTypeForStorage as any,
            };
            booking.startDate = booking.checkInDate || booking.bookingDate || new Date();
            booking.endDate = booking.checkOutDate || booking.checkInDate || booking.bookingDate || booking.startDate;

            const availabilityCheck = await checkResourceAvailability(
                {
                    resourceId: String(resourceId),
                    resourceType: bookingTypeForStorage as any,
                },
                {
                    startDate: booking.startDate,
                    endDate: booking.endDate || booking.startDate,
                },
                String(booking._id)
            );
            if (!availabilityCheck.available && !booking.isRequest) {
                await session.abortTransaction();
                session.endSession();
                res.status(409);
                throw new Error('Resource is already booked for the selected dates');
            }
            await booking.save({ session });
        }

        // Update availability only for instant bookings
        if (!booking.isRequest) {
            await updateAvailabilityAfterBooking(booking, session);
        }

        await session.commitTransaction();
        session.endSession();

        if (bookingTypeNormalized === 'tour' && booking.tour) {
            try {
                const tourDoc = await Tour.findById(booking.tour).lean();
                buildAllocationPlaceholder({
                    bookingId: String(booking._id),
                    packageId: String(booking.tour),
                    guideRequired: tourDoc?.guideRequired,
                    vehicleRequired: tourDoc?.vehicleRequired,
                    hotelRequired: tourDoc?.hotelRequired,
                });
            } catch {
                /* allocation logging is non-blocking */
            }
        }

        // Send confirmation email asynchronously
        sendEmail({
            email: req.user.email,
            subject: 'Booking Received - Dorze Tours',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h1 style="color: #2c3e50;">Booking Received!</h1>
                    <p>Dear ${req.user.first_name},</p>
                    <p>We've received your booking for a <strong>${bookingType}</strong>. Our team is currently reviewing the details.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Booking Summary</h3>
                        <p><strong>Total Price:</strong> $${totalPrice}</p>
                        <p><strong>Status:</strong> Pending Confirmation</p>
                    </div>
                    <p>You will receive another email once your booking is confirmed.</p>
                    <p>Best regards,<br>The Dorze Tours Team</p>
                </div>
            `,
        }).catch(err => logger.error('Confirmation email failed', err));

        res.status(201).json(toSerializableBooking(booking));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

// @desc Get all bookings
// @route GET /api/bookings
// @access Private/Admin
export const getAllBookings = asyncHandler(async (req: any, res: any) => {
    const bookings = await Booking.find()
        .populate('user', 'first_name last_name email')
        .populate('tour', 'title destination')
        .populate('lodge', 'name location')
        .populate('car', 'brand model year')
        .populate({
            path: 'customTrip',
            populate: [
                { path: 'itinerary.destination', model: 'Destination' },
                { path: 'itinerary.itineraryItem', model: 'Itinerary' }
            ]
        });
    res.status(200).json(bookings.map((b: any) => toSerializableBooking(b)));
});

// @desc Update a booking (State transition guard)
// @route PUT /api/bookings/:id
// @access Private/Admin
export const updateBooking = asyncHandler(async (req: any, res: any) => {
    const { notes, proposedPrice, comment, offer, reviewedItinerary, changeSummary } = req.body;
    const status = normalizeInputStatus(req.body?.status);
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    const isRequestBooking = Boolean(booking.isRequest || booking.customTrip);

    // State Transition Guards
    if (status && status !== booking.status) {
        const allowedTransitions: Record<string, string[]> = {
            [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.EXPIRED],
            [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED, BookingStatus.REFUNDED],
            [BookingStatus.CANCELLED]: [],
            [BookingStatus.EXPIRED]: [],
            [BookingStatus.REFUNDED]: [],
            [BookingStatus.UNDER_REVIEW]: [BookingStatus.OFFER_SENT, BookingStatus.CANCELLED],
            [BookingStatus.OFFER_SENT]: [BookingStatus.CONFIRMED, BookingStatus.REJECTED, BookingStatus.UNDER_REVIEW],
            [BookingStatus.REJECTED]: [BookingStatus.UNDER_REVIEW],
            [BookingStatus.SUBMITTED]: [BookingStatus.OFFER_SENT, BookingStatus.CANCELLED],
            [BookingStatus.OFFERED]: [BookingStatus.CONFIRMED, BookingStatus.REJECTED, BookingStatus.UNDER_REVIEW],
            [BookingStatus.ACCEPTED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
        };

        if (!allowedTransitions[booking.status as string]?.includes(status)) {
            res.status(400);
            throw new Error(`Invalid status transition from ${booking.status} to ${status}`);
        }

        // Log history
        booking.history.push({
            status,
            timestamp: new Date(),
            comment: comment || `Status updated to ${status}`
        });
    }

    if (status) booking.status = status as any;
    if (notes) booking.notes = notes;
    if (proposedPrice !== undefined) {
        booking.proposedPrice = proposedPrice;
        // When admin proposes a price, we automatically update total price for visibility or keep separate?
        // Requirement says "convert into standard bookings", so let's keep proposedPrice separate until accepted.
    }
    if (offer) {
        booking.offer = {
            ...offer,
            createdBy: req.user?._id,
            createdAt: new Date(),
            basedOnEstimate: booking.estimateSnapshot?.finalPrice || booking.estimateSnapshot?.estimatedBudget || 0,
        };
    }
    if (isRequestBooking && status === BookingStatus.OFFER_SENT && proposedPrice !== undefined) {
        booking.offer = {
            finalPrice: Number(proposedPrice),
            currency: 'USD',
            breakdown: Array.isArray(offer?.breakdown) ? offer.breakdown : [],
            adminNotes: offer?.adminNotes || comment || '',
            validUntil: offer?.validUntil,
            createdBy: req.user?._id,
            createdAt: new Date(),
            basedOnEstimate: booking.estimateSnapshot?.finalPrice || booking.estimateSnapshot?.estimatedBudget || 0,
        };
    }

    const updatedBooking = await booking.save();

    if (booking.customTrip && (Array.isArray(reviewedItinerary) || Array.isArray(changeSummary))) {
        const customTrip = await CustomTrip.findById(booking.customTrip);
        if (customTrip) {
            if (Array.isArray(reviewedItinerary)) {
                customTrip.reviewedItinerary = reviewedItinerary;
            }
            if (Array.isArray(changeSummary)) {
                customTrip.changeSummary = changeSummary.map((change: any) => ({
                    ...change,
                    changedBy: req.user?._id,
                    changedAt: new Date(),
                }));
            }
            await customTrip.save();
        }
    }

    // If confirmed or moved to pending (ready for pay), ensure availability is updated
    if (status === BookingStatus.CONFIRMED || status === BookingStatus.PENDING) {
        await updateAvailabilityAfterBooking(updatedBooking);
    }

    await createAuditLog({
        user: req.user?._id,
        action: 'Updated booking',
        actionType: 'BOOKING',
        resource: booking.bookingType,
        resourceId: String(booking._id),
        details: `Booking status ${booking.status}${proposedPrice !== undefined ? `, proposedPrice ${proposedPrice}` : ''}`,
        status: 'success',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        actorRole: req.user?.role === 'admin' ? 'admin' : 'user',
        metadata: {
            newStatus: booking.status,
            proposedPrice,
            hasComment: Boolean(comment),
        },
    });

    res.status(200).json(toSerializableBooking(updatedBooking));
});

// @desc Pay remaining balance (Stripe PaymentIntent for authenticated owner)
// @route POST /api/bookings/:id/payments/balance
// @access Private
export const payBookingBalance = asyncHandler(async (req: any, res: any) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    const isOwner = String(booking.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const { balanceDue } = derivePaymentTotals(booking as any);
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > balanceDue + 0.02) {
        res.status(400);
        throw new Error('Invalid payment amount');
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: {
            bookingId: String(booking._id),
            paymentPurpose: 'balance',
        },
    });

    await Payment.create({
        amount,
        booking: booking._id,
        status: 'pending',
        provider: 'stripe',
        txRef: `st_${paymentIntent.id}`,
        stripePaymentIntentId: paymentIntent.id,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
});

// @desc Get user bookings
// @route GET /api/bookings/user
// @access Private
export const getUserBookings = asyncHandler(async (req: any, res: any) => {
    const userBookings = await Booking.find({ user: req.user._id })
        .populate('tour', 'title destination images')
        .populate('lodge', 'name location images')
        .populate('car', 'brand model images')
        .populate({
            path: 'customTrip',
            populate: [
                { path: 'itinerary.destination', model: 'Destination' },
                { path: 'itinerary.itineraryItem', model: 'Itinerary' },
                { path: 'reviewedItinerary.destination', model: 'Destination' },
                { path: 'reviewedItinerary.itineraryItem', model: 'Itinerary' }
            ]
        });
    res.status(200).json(
        userBookings.map((b: any) => {
            const serialized = toSerializableBooking(b);
            const summary = paymentSummaryFromBooking(b);
            const customer = { ...(serialized as any) };
            delete customer.internalNotes;
            delete customer.auditTrail;
            return { ...customer, paymentSummary: summary };
        })
    );
});

// @desc Get booking by ID
// @route GET /api/bookings/:id
// @access Private
export const getBookingById = asyncHandler(async (req: any, res: any) => {
    const booking = await Booking.findById(req.params.id)
        .populate('user', 'first_name last_name email')
        .populate('tour', 'title destination images')
        .populate('lodge', 'name location images')
        .populate('car', 'brand model images')
        .populate({
            path: 'customTrip',
            populate: [
                { path: 'itinerary.destination', model: 'Destination' },
                { path: 'itinerary.itineraryItem', model: 'Itinerary' },
                { path: 'reviewedItinerary.destination', model: 'Destination' },
                { path: 'reviewedItinerary.itineraryItem', model: 'Itinerary' }
            ]
        });

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    const isOwner = String(booking.user?._id || booking.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to view this booking');
    }

    const serialized = toSerializableBooking(booking);
    const summary = paymentSummaryFromBooking(booking as any);
    if (isAdmin) {
        res.status(200).json({ ...(serialized as any), paymentSummary: summary });
        return;
    }

    const customer = { ...(serialized as any) };
    delete customer.internalNotes;
    delete customer.auditTrail;
    res.status(200).json({ ...customer, paymentSummary: summary });
});

// @desc User responds to custom offer
// @route PUT /api/bookings/:id/respond-offer
// @access Private
export const respondToOffer = asyncHandler(async (req: any, res: any) => {
    const { decision, note } = req.body as { decision: 'accepted' | 'rejected'; note?: string };
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    const isOwner = String(booking.user) === String(req.user._id);
    if (!isOwner) {
        res.status(403);
        throw new Error('Not authorized to respond to this offer');
    }
    if (!booking.isRequest && !booking.customTrip) {
        res.status(400);
        throw new Error('This booking does not support offer responses');
    }
    const normalizedCurrentStatus = normalizeInputStatus(String(booking.status));
    if (normalizedCurrentStatus !== BookingStatus.OFFER_SENT) {
        res.status(400);
        throw new Error('Offer response is only allowed when status is offer_sent');
    }

    const nextStatus = decision === 'accepted' ? BookingStatus.CONFIRMED : BookingStatus.REJECTED;

    if (decision === 'accepted') {
        const { hasConflict, conflicts } = await checkResourceConflicts(booking);
        if (hasConflict) {
            res.status(409);
            throw new Error(`Cannot accept offer due to availability changes: ${conflicts.join('; ')}`);
        }
        booking.totalPrice = Number(booking.offer?.finalPrice || booking.proposedPrice || booking.totalPrice || 0);
    }

    booking.status = nextStatus;
    booking.history.push({
        status: nextStatus,
        timestamp: new Date(),
        comment: note || (decision === 'accepted'
            ? 'User accepted offer and booking confirmed'
            : `User ${decision} the admin offer`),
    });
    const updated = await booking.save();
    if (decision === 'accepted') {
        await updateAvailabilityAfterBooking(updated);
    }

    await createAuditLog({
        user: req.user?._id,
        action: decision === 'accepted' ? 'Accepted offer and confirmed booking' : 'Rejected offer',
        actionType: 'BOOKING',
        resource: booking.bookingType,
        resourceId: String(booking._id),
        details: decision === 'accepted'
            ? 'User accepted custom request offer; reservation confirmed and availability reserved'
            : 'User rejected custom request offer',
        status: 'success',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        actorRole: 'user',
        metadata: {
            decision,
            note: note || '',
            finalStatus: nextStatus,
        },
    });

    res.status(200).json(toSerializableBooking(updated));
});

// @desc Confirm accepted request without payment
// @route PUT /api/bookings/:id/confirm-request
// @access Private/Admin
export const confirmRequestBooking = asyncHandler(async (req: any, res: any) => {
    const { comment } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }
    if (!booking.isRequest && !booking.customTrip) {
        res.status(400);
        throw new Error('This booking is not a request booking');
    }
    const normalizedCurrentStatus = normalizeInputStatus(String(booking.status));
    if (normalizedCurrentStatus !== BookingStatus.CONFIRMED && normalizedCurrentStatus !== BookingStatus.ACCEPTED) {
        res.status(400);
        throw new Error('Only accepted/confirmed offers can be confirmed');
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.totalPrice = Number(booking.offer?.finalPrice || booking.proposedPrice || booking.totalPrice || 0);
    booking.history.push({
        status: BookingStatus.CONFIRMED,
        timestamp: new Date(),
        comment: comment || 'Confirmed by admin without payment',
    });

    const updated = await booking.save();
    await updateAvailabilityAfterBooking(updated);

    await createAuditLog({
        user: req.user?._id,
        action: 'Confirmed request booking',
        actionType: 'BOOKING',
        resource: booking.bookingType,
        resourceId: String(booking._id),
        details: 'Accepted request confirmed without payment',
        status: 'success',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        actorRole: 'admin',
    });

    res.status(200).json(toSerializableBooking(updated));
});

// @desc Get booking timeline (history + audit logs)
// @route GET /api/bookings/:id/timeline
// @access Private
export const getBookingTimeline = asyncHandler(async (req: any, res: any) => {
    const booking = await Booking.findById(req.params.id).populate('user', 'first_name last_name email');
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    const isOwner = String(booking.user?._id || booking.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to view this timeline');
    }

    const auditEvents = await Log.find({ resourceId: String(booking._id) })
        .sort({ createdAt: 1 })
        .lean();

    const historyEvents = (booking.history || []).map((entry) => ({
        type: 'status',
        status: canonicalStatusForOutput(entry.status),
        legacyStatus: entry.status !== canonicalStatusForOutput(entry.status) ? entry.status : undefined,
        timestamp: entry.timestamp,
        comment: entry.comment || '',
    }));

    const logEvents = auditEvents.map((log: any) => ({
        type: 'audit',
        action: log.action,
        actionType: log.actionType,
        details: log.details,
        actorRole: log.actorRole,
        timestamp: log.createdAt,
        metadata: log.metadata || {},
    }));

    const timeline = [...historyEvents, ...logEvents].sort(
        (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    res.status(200).json(timeline);
});

// @desc Cancel booking
// @route DELETE /api/bookings/:id/cancel
// @access Private
export const cancelBooking = asyncHandler(async (req: any, res: any) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    const isOwner = String(booking.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to cancel this booking');
    }

    booking.status = BookingStatus.CANCELLED;
    await booking.save();

    await createAuditLog({
        user: req.user?._id,
        action: 'Cancelled booking',
        actionType: 'BOOKING',
        resource: booking.bookingType,
        resourceId: String(booking._id),
        details: `Booking cancelled by ${req.user?.role || 'user'}`,
        status: 'warning',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        actorRole: req.user?.role === 'admin' ? 'admin' : 'user',
    });

    res.status(200).json({ message: 'Booking cancelled' });
});

// @desc Delete booking
// @route DELETE /api/bookings/:id
// @access Private
export const deleteBooking = asyncHandler(async (req: any, res: any) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    const isOwner = String(booking.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to delete this booking');
    }

    const deletedBookingType = booking.bookingType;
    await booking.deleteOne();

    await createAuditLog({
        user: req.user?._id,
        action: 'Deleted booking',
        actionType: 'BOOKING',
        resource: deletedBookingType,
        resourceId: String(req.params.id),
        details: `Booking deleted by ${req.user?.role || 'user'}`,
        status: 'warning',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        actorRole: req.user?.role === 'admin' ? 'admin' : 'user',
    });

    res.status(200).json({ message: 'Booking deleted' });
});

// @desc Check lodge availability
// @route GET /api/bookings/check-availability
// @access Private
export const checkAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { lodgeId, checkInDate, checkOutDate } = req.query;

    if (!lodgeId || !checkInDate || !checkOutDate) {
        res.status(400);
        throw new Error('Please provide lodgeId, checkInDate, and checkOutDate');
    }

    const start = new Date(checkInDate as string);
    const end = new Date(checkOutDate as string);

    const lodge = await Lodge.findById(lodgeId);
    if (!lodge) {
        res.status(404);
        throw new Error('Lodge not found');
    }

    // Find overlapping bookings for this lodge
    const bookings = await Booking.find({
        lodge: lodgeId,
        status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        $or: [
            { checkInDate: { $lt: end }, checkOutDate: { $gt: start } }
        ]
    });

    // Calculate available rooms for each room type
    const availability = lodge.roomTypes.map((roomType: any) => {
        const bookedRooms = bookings.filter(b => b.roomType === roomType.type).length;
        const totalRooms = roomType.availableRooms || 10;
        return {
            type: roomType.type,
            available: Math.max(0, totalRooms - bookedRooms),
            total: totalRooms,
            price: roomType.price
        };
    });

    res.status(200).json(availability);
});

// Cron job for expiring pending bookings
export const checkAndCancelExpiredBookings = async () => {
    const expirationTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    try {
        const result = await Booking.updateMany(
            { status: BookingStatus.PENDING, createdAt: { $lt: expirationTime } },
            { $set: { status: BookingStatus.EXPIRED } }
        );
        if (result.modifiedCount > 0) {
            logger.info(`Expired ${result.modifiedCount} pending bookings`);
            await createAuditLog({
                action: 'Expired stale bookings',
                actionType: 'SYSTEM',
                resource: 'Booking',
                details: `Auto-expired ${result.modifiedCount} pending bookings older than 24h`,
                status: 'info',
                actorRole: 'system',
                metadata: { modifiedCount: result.modifiedCount },
            });
        }
    } catch (error) {
        logger.error('Error during expired bookings cleanup', error);
    }
};

cron.schedule('0 * * * *', checkAndCancelExpiredBookings);
