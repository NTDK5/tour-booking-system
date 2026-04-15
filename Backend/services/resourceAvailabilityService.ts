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

export const buildOverlapQuery = (resource: ResourceRef, range: DateRange, excludeBookingId?: string) => {
    const normalized = normalizeRange(range);
    const query: any = {
        'resource.resourceId': resource.resourceId,
        'resource.resourceType': resource.resourceType,
        status: { $in: ACTIVE_BOOKING_STATUSES },
        startDate: { $lte: normalized.end },
        endDate: { $gte: normalized.start },
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
    const normalized = normalizeRange(range);
    const query: any = {
        startDate: { $lte: normalized.end },
        endDate: { $gte: normalized.start },
    };
    if (filters?.resourceType) query['resource.resourceType'] = filters.resourceType;
    if (filters?.resourceId) query['resource.resourceId'] = filters.resourceId;

    return Booking.find(query)
        .populate('user', 'first_name last_name email')
        .populate('tour', 'title destination')
        .populate('lodge', 'name location')
        .populate('car', 'brand carModel model')
        .populate('customTrip', 'days mode')
        .sort({ startDate: 1 })
        .lean();
};
