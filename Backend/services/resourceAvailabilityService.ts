import { startOfDay } from 'date-fns';
import Booking from '../models/bookingModel';

const ACTIVE_BOOKING_STATUSES = ['pending', 'under_review', 'offer_sent', 'submitted', 'offered', 'accepted', 'confirmed'];

type ResourceRef = {
    resourceId: string;
    resourceType: 'Lodge' | 'Tour' | 'Car' | 'Guide' | 'Service';
};

type DateRange = {
    startDate: Date;
    endDate: Date;
};

const normalizeRange = ({ startDate, endDate }: DateRange) => {
    const start = startOfDay(new Date(startDate));
    const end = startOfDay(new Date(endDate || startDate));
    return {
        start,
        end: end < start ? start : end,
    };
};

const getLegacyResourceField = (resourceType: ResourceRef['resourceType']) => {
    if (resourceType === 'Lodge') return 'lodge';
    if (resourceType === 'Tour') return 'tour';
    if (resourceType === 'Car') return 'car';
    return null;
};

const buildDateOverlapQuery = (range: DateRange) => {
    const normalized = normalizeRange(range);
    return {
        $or: [
            // New unified date fields
            {
                startDate: { $lte: normalized.end },
                endDate: { $gte: normalized.start },
            },
            // Legacy lodge/car date fields
            {
                checkInDate: { $lte: normalized.end },
                checkOutDate: { $gte: normalized.start },
            },
            // Legacy single-date bookings (tour, etc.)
            {
                bookingDate: { $gte: normalized.start, $lte: normalized.end },
            },
            // Extra fallback to creation date for very old records
            {
                createdAt: { $gte: normalized.start, $lte: normalized.end },
            },
        ],
    };
};

const buildResourceQuery = (filters?: { resourceType?: string; resourceId?: string }) => {
    if (!filters?.resourceType && !filters?.resourceId) return {};

    const andClauses: any[] = [];

    if (filters.resourceType) {
        andClauses.push({
            $or: [{ 'resource.resourceType': filters.resourceType }, { bookingType: filters.resourceType }],
        });
    }

    if (filters.resourceId) {
        const idClauses: any[] = [{ 'resource.resourceId': filters.resourceId }];
        if (filters.resourceType) {
            const legacyField = getLegacyResourceField(filters.resourceType as ResourceRef['resourceType']);
            if (legacyField) idClauses.push({ [legacyField]: filters.resourceId });
        }
        andClauses.push({ $or: idClauses });
    }

    if (!andClauses.length) return {};
    if (andClauses.length === 1) return andClauses[0];
    return { $and: andClauses };
};

export const buildOverlapQuery = (resource: ResourceRef, range: DateRange, excludeBookingId?: string) => {
    const resourceQuery = buildResourceQuery({
        resourceType: resource.resourceType,
        resourceId: resource.resourceId,
    });
    const dateOverlapQuery = buildDateOverlapQuery(range);
    const query: any = {
        status: { $in: ACTIVE_BOOKING_STATUSES },
        ...dateOverlapQuery,
        ...resourceQuery,
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }
    return query;
};

export const checkResourceAvailability = async (resource: ResourceRef, range: DateRange, excludeBookingId?: string) => {
    const query = buildOverlapQuery(resource, range, excludeBookingId);
    const conflicts = await Booking.find(query).select('_id status user startDate endDate totalPrice').lean();
    return {
        available: conflicts.length === 0,
        conflicts,
    };
};

export const getBookingsForCalendarRange = async (range: DateRange, filters?: { resourceType?: string; resourceId?: string }) => {
    const query: any = {
        ...buildDateOverlapQuery(range),
        ...buildResourceQuery(filters),
    };

    return Booking.find(query)
        .populate('user', 'first_name last_name email')
        .populate('tour', 'title destination')
        .populate('lodge', 'name location')
        .populate('car', 'brand carModel model')
        .populate('customTrip', 'days mode')
        .sort({ startDate: 1 })
        .lean();
};
