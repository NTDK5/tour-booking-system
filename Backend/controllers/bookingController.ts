import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import cron from 'node-cron';
import mongoose from 'mongoose';
import Booking from '../models/bookingModel';
import Tour from '../models/tourModel';
import Lodge from '../models/lodgeModel';
import Car from '../models/carModel';
import logger from '../utils/logger';
import { sendEmail } from '../utils/email';
import { AuthRequest } from '../middleware/authMiddleware';
import Availability from '../models/availabilityModel';
import { eachDayOfInterval, startOfDay } from 'date-fns';

// Explicit Statuses
export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
    REFUNDED = 'refunded',
    SUBMITTED = 'submitted',
    OFFERED = 'offered',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

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

// @desc Create a new booking
// @route POST /api/bookings
// @access Private
export const createBooking = asyncHandler(async (req: any, res: any) => {
    const {
        bookingType,
        tourId,
        lodgeId,
        carId,
        car,
        numberOfPeople = 1,
        paymentMethod,
        notes,
        checkInDate,
        checkOutDate,
        roomType,
        pickupLocation,
        dropoffLocation,
        bookingDate,
        isRequest = false,
        customCarRequest
    } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bookingTypeNormalized = String(bookingType || '').toLowerCase();
        const bookingTypeForStorage =
            bookingTypeNormalized === 'tour'
                ? 'Tour'
                : bookingTypeNormalized === 'lodge'
                    ? 'Lodge'
                    : 'Car';

        const userId = req.user._id;
        let totalPrice = 0;
        let bookingDetails: any = {};

        // Handle Tour booking
        if (bookingTypeNormalized === 'tour') {
            const tour = await Tour.findById(tourId).session(session);
            if (!tour) {
                res.status(404);
                throw new Error('Tour not found');
            }
            totalPrice = tour.price * numberOfPeople;
            bookingDetails = {
                tour: tourId,
                bookingDate: bookingDate ? new Date(bookingDate) : undefined
            };
            if (!bookingDetails.bookingDate) {
                res.status(400);
                throw new Error('bookingDate is required for Tour bookings');
            }
        }

        // Handle Lodge booking
        else if (bookingTypeNormalized === 'lodge') {
            const lodge: any = await Lodge.findById(lodgeId).session(session);
            if (!lodge) {
                res.status(404);
                throw new Error('Lodge not found');
            }

            const selectedRoomType = lodge.roomTypes?.find(
                (room: any) => room.type === roomType
            );
            if (!selectedRoomType) {
                res.status(400);
                throw new Error('Invalid room type selected');
            }

            const numberOfNights = checkOutDate && checkInDate ? Math.ceil(
                (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
            ) : 1;

            totalPrice = selectedRoomType.price * numberOfNights;
            bookingDetails = {
                lodge: lodgeId,
                checkInDate,
                checkOutDate,
                roomType
            };
        }

        // Handle Car booking
        else if (bookingTypeNormalized === 'car' && !carId && !car && customCarRequest) {
            totalPrice = 0; // Price will be proposed by admin
            bookingDetails = {
                customCarRequest,
                isRequest: true,
                status: BookingStatus.SUBMITTED
            };
        }

        // Handle Car booking from fleet
        else if (bookingTypeNormalized === 'car') {
            const selectedCarId = carId || car;
            const selectedCar: any = await Car.findById(selectedCarId).session(session);
            if (!selectedCar) {
                res.status(404);
                throw new Error('Car not found');
            }
            if (!selectedCar.available) {
                res.status(400);
                throw new Error('Car is not available for booking');
            }

            const numberOfDays = checkOutDate && checkInDate ? Math.ceil(
                (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
            ) : 1;

            totalPrice = selectedCar.pricePerDay * numberOfDays;
            bookingDetails = {
                car: selectedCarId,
                checkInDate,
                checkOutDate,
                pickupLocation,
                dropoffLocation
            };
        }

        // Create the booking with PENDING status
        const [booking] = await Booking.create([{
            user: userId,
            bookingType: bookingTypeForStorage,
            numberOfPeople,
            totalPrice,
            paymentMethod: paymentMethod || 'paypal',
            notes,
            status: (isRequest || customCarRequest) ? BookingStatus.SUBMITTED : BookingStatus.PENDING,
            isRequest: isRequest || !!customCarRequest,
            ...bookingDetails
        }], { session });

        // Update availability only for instant bookings
        if (!isRequest) {
            await updateAvailabilityAfterBooking(booking, session);
        }

        await session.commitTransaction();
        session.endSession();

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

        res.status(201).json(booking);
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
    res.status(200).json(bookings);
});

// @desc Update a booking (State transition guard)
// @route PUT /api/bookings/:id
// @access Private/Admin
export const updateBooking = asyncHandler(async (req: any, res: any) => {
    const { status, notes, proposedPrice, comment } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // State Transition Guards
    if (status && status !== booking.status) {
        const allowedTransitions: Record<string, string[]> = {
            [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.EXPIRED],
            [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED, BookingStatus.REFUNDED],
            [BookingStatus.CANCELLED]: [],
            [BookingStatus.EXPIRED]: [],
            [BookingStatus.REFUNDED]: [],
            [BookingStatus.SUBMITTED]: [BookingStatus.OFFERED, BookingStatus.CANCELLED, BookingStatus.REJECTED],
            [BookingStatus.OFFERED]: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED],
            [BookingStatus.ACCEPTED]: [BookingStatus.PENDING, BookingStatus.CANCELLED],
            [BookingStatus.REJECTED]: [],
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

    if (status) booking.status = status;
    if (notes) booking.notes = notes;
    if (proposedPrice !== undefined) {
        booking.proposedPrice = proposedPrice;
        // When admin proposes a price, we automatically update total price for visibility or keep separate?
        // Requirement says "convert into standard bookings", so let's keep proposedPrice separate until accepted.
    }

    const updatedBooking = await booking.save();

    // If confirmed or moved to pending (ready for pay), ensure availability is updated
    if (status === BookingStatus.CONFIRMED || status === BookingStatus.PENDING) {
        await updateAvailabilityAfterBooking(updatedBooking);
    }

    res.status(200).json(updatedBooking);
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
                { path: 'itinerary.itineraryItem', model: 'Itinerary' }
            ]
        });
    res.status(200).json(userBookings);
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
                { path: 'itinerary.itineraryItem', model: 'Itinerary' }
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

    res.status(200).json(booking);
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

    res.status(200).json({ message: 'Booking cancelled' });
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
        }
    } catch (error) {
        logger.error('Error during expired bookings cleanup', error);
    }
};

cron.schedule('0 * * * *', checkAndCancelExpiredBookings);
