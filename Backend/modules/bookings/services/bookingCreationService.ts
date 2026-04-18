import mongoose from 'mongoose';
import Tour from '../../../models/tourModel';
import Lodge from '../../../models/lodgeModel';
import Car from '../../../models/carModel';
import Booking from '../../../models/bookingModel';
import { ApiError } from '../../../utils/ApiError';
import { checkPackageAvailability } from '../../packages/services/availabilityService';
import { buildTourPricingSnapshot } from '../pricing/bookingPricingService';
import { reserveDepartureSeats } from './bookingInventoryService';
import { appendLedgerEntry } from '../payments/bookingPaymentService';
import { appendBookingAudit } from '../audit/bookingAuditService';
import type { IBooking } from '../models/bookingSchema';
import type { AuthRequest } from '../../../middleware/authMiddleware';
import { generateBookingNumber } from './bookingNumberService';

/** Mirrors legacy BookingStatus strings used in controllers */
const BS = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    CONFIRMED: 'confirmed',
    SUBMITTED: 'submitted',
} as const;

function ledgerMethod(pm?: string): string {
    const p = String(pm || 'paypal').toLowerCase();
    if (p.includes('stripe') || p === 'card') return 'stripe';
    if (p.includes('paypal')) return 'paypal';
    if (p.includes('bank')) return 'bank_transfer';
    if (p.includes('cash')) return 'cash';
    return pm || 'paypal';
}

function ledgerProvider(pm?: string): 'paypal' | 'stripe' | 'manual' | 'cash' | 'bank_transfer' {
    const m = ledgerMethod(pm);
    if (m === 'stripe') return 'stripe';
    if (m === 'paypal') return 'paypal';
    if (m === 'bank_transfer') return 'bank_transfer';
    if (m === 'cash') return 'cash';
    return 'manual';
}

export async function createBookingTransactional(
    req: AuthRequest,
    session: mongoose.ClientSession
): Promise<IBooking> {
    const {
        bookingType,
        tourId,
        lodgeId,
        carId,
        car,
        numberOfPeople = 1,
        children = 0,
        departureId,
        selectedAddons,
        travelers,
        paymentMethod,
        notes,
        checkInDate,
        checkOutDate,
        roomType,
        pickupLocation,
        dropoffLocation,
        bookingDate,
        isRequest = false,
        customCarRequest,
    } = req.body;

    const bookingTypeNormalized = String(bookingType || '').toLowerCase();
    const bookingTypeForStorage =
        bookingTypeNormalized === 'tour'
            ? 'Tour'
            : bookingTypeNormalized === 'lodge'
              ? 'Lodge'
              : 'Car';

    if (!req.user?._id) throw new ApiError(401, 'Unauthorized');
    const userId = req.user._id as mongoose.Types.ObjectId;
    let totalPrice = 0;
    let bookingDetails: Partial<IBooking> = {};
    let inventoryPhase: IBooking['inventoryPhase'] = 'none';

    const bookingNumber = await generateBookingNumber();

    // --- Tour ---
    if (bookingTypeNormalized === 'tour') {
        const tour = await Tour.findById(tourId).session(session);
        if (!tour) throw new ApiError(404, 'Tour not found');

        const addonNames: string[] =
            Array.isArray(selectedAddons) && selectedAddons.length
                ? selectedAddons.map((a: any) => (typeof a === 'string' ? a : a?.name)).filter(Boolean)
                : [];

        const guestTotal = Math.max(1, Number(numberOfPeople) || 1);
        const childCount = Math.max(0, Math.min(Number(children) || 0, guestTotal));

        const avail = await checkPackageAvailability(tour, {
            packageId: String(tourId),
            departureId: departureId ? String(departureId) : undefined,
            guests: guestTotal,
            bookingDate: bookingDate ? new Date(bookingDate) : undefined,
        });
        if (!avail.available) {
            throw new ApiError(409, avail.reasons.join('; ') || 'Not available for selected options');
        }

        const { snapshot, quote, addOnLines } = buildTourPricingSnapshot(
            tour,
            {
                guests: guestTotal,
                children: childCount,
                travelDate: bookingDate ? new Date(bookingDate) : undefined,
                selectedAddonNames: addonNames,
            },
            String(tourId)
        );

        totalPrice = quote.total;
        const depositAmount = quote.deposit;

        const persistedAddons = addonNames.map((name) => {
            const addon = (tour as any).addons?.find((x: any) => x?.name === name);
            return { name, price: Number(addon?.price ?? 0) };
        });

        if (!bookingDate) throw new ApiError(400, 'bookingDate is required for Tour bookings');

        if (departureId) {
            await reserveDepartureSeats(departureId, guestTotal, session);
            inventoryPhase = 'reserved';
        }

        const normalizedTravelers =
            Array.isArray(travelers) && travelers.length
                ? travelers.map((t: any) => ({
                      fullName: String(t.fullName || '').trim(),
                      travelerType: (t.travelerType as any) || 'adult',
                      passportNumber: t.passportNumber,
                      nationality: t.nationality,
                      dateOfBirth: t.dateOfBirth ? new Date(t.dateOfBirth) : undefined,
                      gender: t.gender,
                      dietaryRequirements: t.dietaryRequirements,
                      emergencyContact: t.emergencyContact,
                  }))
                : undefined;

        bookingDetails = {
            tour: tourId,
            bookingDate: new Date(bookingDate),
            departureId: departureId || undefined,
            selectedAddons: persistedAddons.length ? persistedAddons : undefined,
            addOnLines: addOnLines.length ? addOnLines : undefined,
            packagePricingSnapshot: {
                currency: quote.currency,
                lines: quote.lines,
                subtotal: quote.subtotal,
                discounts: quote.discounts,
                deposit: quote.deposit,
                total: quote.total,
                pricingType: quote.pricingType,
                quotedAt: new Date(),
                guests: guestTotal,
                children: childCount,
            },
            pricingSnapshot: snapshot,
            depositAmount,
            travelers: normalizedTravelers,
            bookingNumber,
            lifecycleStatus: 'pending',
            inventoryPhase,
            workflow: { workflowStatus: 'intake', voucherIssued: false, documentsSent: false, operationsAssigned: false },
            schemaVersion: 2,
        };
    }

    // --- Lodge ---
    else if (bookingTypeNormalized === 'lodge') {
        const lodge: any = await Lodge.findById(lodgeId).session(session);
        if (!lodge) throw new ApiError(404, 'Lodge not found');

        const selectedRoomType = lodge.roomTypes?.find((room: any) => room.type === roomType);
        if (!selectedRoomType) throw new ApiError(400, 'Invalid room type selected');

        const numberOfNights =
            checkOutDate && checkInDate
                ? Math.ceil(
                      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
                  )
                : 1;

        totalPrice = selectedRoomType.price * numberOfNights;
        bookingDetails = {
            lodge: lodgeId,
            checkInDate,
            checkOutDate,
            roomType,
            bookingNumber,
            lifecycleStatus: 'pending',
            inventoryPhase: 'none',
            workflow: { workflowStatus: 'intake' },
            schemaVersion: 2,
        };
    }

    // --- Car custom request ---
    else if (bookingTypeNormalized === 'car' && !carId && !car && customCarRequest) {
        totalPrice = 0;
        bookingDetails = {
            customCarRequest,
            isRequest: true,
            status: BS.SUBMITTED as any,
            bookingNumber,
            lifecycleStatus: 'pending',
            inventoryPhase: 'none',
            workflow: { workflowStatus: 'intake' },
            schemaVersion: 2,
        };
    }

    // --- Car fleet ---
    else if (bookingTypeNormalized === 'car') {
        const selectedCarId = carId || car;
        const selectedCar: any = await Car.findById(selectedCarId).session(session);
        if (!selectedCar) throw new ApiError(404, 'Car not found');
        if (!selectedCar.available) throw new ApiError(400, 'Car is not available for booking');

        const numberOfDays =
            checkOutDate && checkInDate
                ? Math.ceil(
                      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
                  )
                : 1;

        totalPrice = selectedCar.pricePerDay * numberOfDays;
        bookingDetails = {
            car: selectedCarId,
            checkInDate,
            checkOutDate,
            pickupLocation,
            dropoffLocation,
            bookingNumber,
            lifecycleStatus: 'pending',
            inventoryPhase: 'none',
            workflow: { workflowStatus: 'intake' },
            schemaVersion: 2,
        };
    } else {
        throw new ApiError(400, 'Invalid booking payload');
    }

    const pendingStatus =
        isRequest || customCarRequest ? BS.UNDER_REVIEW : BS.PENDING;

    const [booking] = await Booking.create(
        [
            {
                user: userId,
                bookingType: bookingTypeForStorage,
                numberOfPeople,
                totalPrice,
                paymentMethod: paymentMethod || 'paypal',
                notes,
                status: pendingStatus as any,
                isRequest: isRequest || !!customCarRequest,
                ...bookingDetails,
            },
        ],
        { session }
    );

    // Initial ledger row for priced bookings (deposit intent — completed rows drive paid state)
    if (booking.pricingSnapshot?.depositAmount != null && booking.pricingSnapshot.depositAmount > 0) {
        appendLedgerEntry(booking, {
            paymentType: 'deposit',
            amount: booking.pricingSnapshot.depositAmount,
            currency: booking.pricingSnapshot.currency,
            method: ledgerMethod(paymentMethod),
            status: 'pending',
            provider: ledgerProvider(paymentMethod),
        });
    }

    await appendBookingAudit(booking, {
        action: isRequest || customCarRequest ? 'booking_request_created' : 'booking_created',
        performedBy: userId,
        notes: `${bookingTypeForStorage} booking`,
        metadata: { bookingNumber: booking.bookingNumber, totalPrice },
    });

    await booking.save({ session });

    return booking;
}
