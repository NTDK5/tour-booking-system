import mongoose from 'mongoose';
import PackageDeparture from '../packages/models/packageDepartureModel';
import Assignment from '../assignments/models/assignment.model';
import Booking from '../../models/bookingModel';
import Tour from '../../models/tourModel';
import Car from '../../models/carModel';
import type { BookingLifecycleStatus, LegacyBookingStatus } from '../bookings/models/bookingSchema';
import type {
    CalendarAlertPayload,
    CalendarEventsQuery,
    CalendarEventSeverity,
    DepartureReadiness,
    UnifiedCalendarEvent,
} from './calendar.types';

const isObjectId = (value?: string) => !!value && mongoose.Types.ObjectId.isValid(value);

const overlapQuery = (startDate: Date, endDate: Date) => ({
    $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
        { checkInDate: { $lte: endDate }, checkOutDate: { $gte: startDate } },
        { bookingDate: { $gte: startDate, $lte: endDate } },
        { createdAt: { $gte: startDate, $lte: endDate } },
    ],
});

const normalizeBookingStatus = (booking: any): string => {
    return String(booking.lifecycleStatus || booking.status || 'pending');
};

const seatNumbers = (departure: any) => {
    const reserved = Number(departure.reservedGuests || 0);
    const confirmed = Number(departure.confirmedGuests || 0);
    const occupied = reserved + confirmed;
    const capacity = Number(departure.capacity || 0);
    const available = Math.max(0, capacity - occupied);
    return { reserved, confirmed, occupied, capacity, available };
};

const severityByStatus = (status: string): CalendarEventSeverity => {
    if (status === 'cancelled') return 'high';
    if (status === 'pending' || status === 'under_review') return 'medium';
    return 'low';
};

const isPendingBookingStatus = (status: string) =>
    status === 'pending' || status === 'under_review' || status === 'pending_payment' || status === 'draft';

const deriveDepartureReadiness = (input: {
    hasGuide: boolean;
    hasDriver: boolean;
    hasVehicle: boolean;
    overbooked: boolean;
}): DepartureReadiness => {
    if (input.overbooked || !input.hasGuide || !input.hasVehicle) return 'blocked';
    if (!input.hasDriver) return 'partial';
    return 'ready';
};

const fetchDeparturesInRange = async (query: CalendarEventsQuery) => {
    const departureQuery: any = {
        startsAt: { $lte: query.endDate },
        $or: [{ endsAt: { $gte: query.startDate } }, { endsAt: { $exists: false } }, { endsAt: null }],
    };
    if (isObjectId(query.packageId)) departureQuery.packageId = query.packageId;
    if (query.status) departureQuery.status = query.status;

    return PackageDeparture.find(departureQuery)
        .select('_id packageId startsAt endsAt status capacity reservedGuests confirmedGuests')
        .sort({ startsAt: 1 })
        .lean();
};

const fetchAssignmentsInRange = async (query: CalendarEventsQuery, departureIds: any[]) => {
    const assignmentsQuery: any = {
        status: { $ne: 'cancelled' },
        startDate: { $lte: query.endDate },
        endDate: { $gte: query.startDate },
    };
    if (departureIds.length) assignmentsQuery.departureId = { $in: departureIds };
    if (isObjectId(query.guideId) || isObjectId(query.driverId)) {
        assignmentsQuery.staffId = {
            $in: [query.guideId, query.driverId].filter(Boolean),
        };
    }

    return Assignment.find(assignmentsQuery)
        .select('_id staffId role departureId startDate endDate status')
        .populate('staffId', 'fullName role')
        .lean();
};

const fetchBookingsInRange = async (query: CalendarEventsQuery, departureIds: any[]) => {
    const bookingsQuery: any = overlapQuery(query.startDate, query.endDate);
    if (departureIds.length) {
        bookingsQuery.$or = [
            ...(bookingsQuery.$or || []),
            { departureId: { $in: departureIds } },
        ];
    }
    if (query.status) {
        bookingsQuery.$or = [
            ...(bookingsQuery.$or || []),
            { lifecycleStatus: query.status as BookingLifecycleStatus },
            { status: query.status as LegacyBookingStatus },
        ];
    }
    if (isObjectId(query.vehicleId)) bookingsQuery.assignedVehicle = query.vehicleId;

    return Booking.find(bookingsQuery)
        .select('_id bookingType bookingDate checkInDate checkOutDate startDate endDate departureId lifecycleStatus status numberOfPeople assignedVehicle assignedGuide tour lodge car user workflow')
        .populate('tour', 'title')
        .populate('lodge', 'name')
        .populate('car', 'brand carModel')
        .populate('user', 'first_name last_name')
        .populate('assignedVehicle', 'brand carModel seats')
        .lean();
};

const buildOperationalAlerts = (input: {
    departureId?: string;
    bookingId?: string;
    title: string;
    start: Date | string;
    end: Date | string;
    severity: CalendarEventSeverity;
    code: CalendarAlertPayload['code'];
    message: string;
    relatedStaffIds?: string[];
    relatedVehicleIds?: string[];
}) : UnifiedCalendarEvent => ({
    id: `alert:${input.code.toLowerCase()}:${input.departureId || input.bookingId}`,
    eventType: 'operational_alert',
    title: input.title,
    start: new Date(input.start).toISOString(),
    end: new Date(input.end).toISOString(),
    status: 'open',
    severity: input.severity,
    relatedDepartureId: input.departureId,
    relatedBookingId: input.bookingId,
    relatedStaffIds: input.relatedStaffIds || [],
    relatedVehicleIds: input.relatedVehicleIds || [],
    alerts: [{ code: input.code, message: input.message, severity: input.severity }],
    metadata: { alertCode: input.code },
});

const buildVehicleAllocationEvents = (bookings: any[], vehicleNameMap: Map<string, { name: string; seats: number }>) =>
    bookings
        .map((booking: any) => {
            const vehicleId = booking.assignedVehicle?._id || booking.assignedVehicle;
            if (!vehicleId) return null;

            const bookingStatus = normalizeBookingStatus(booking);
            const bookingStart = booking.startDate || booking.checkInDate || booking.bookingDate || booking.createdAt;
            const bookingEnd = booking.endDate || booking.checkOutDate || bookingStart;
            const vehicleIdStr = String(vehicleId);
            const vehicle = vehicleNameMap.get(vehicleIdStr);
            const people = Number(booking.numberOfPeople || 1);

            return {
                id: `vehicle:${booking._id}:${vehicleIdStr}`,
                eventType: 'vehicle_assignment' as const,
                title: `${vehicle?.name || 'Vehicle'} allocation`,
                start: new Date(bookingStart).toISOString(),
                end: new Date(bookingEnd).toISOString(),
                status: bookingStatus,
                severity: severityByStatus(bookingStatus),
                relatedDepartureId: booking.departureId ? String(booking.departureId) : undefined,
                relatedBookingId: String(booking._id),
                relatedStaffIds: [],
                relatedVehicleIds: [vehicleIdStr],
                alerts: [],
                metadata: {
                    occupancySeats: people,
                    vehicleSeats: vehicle?.seats ?? null,
                },
            } as UnifiedCalendarEvent;
        })
        .filter(Boolean) as UnifiedCalendarEvent[];

const applyEventFilters = (events: UnifiedCalendarEvent[], query: CalendarEventsQuery): UnifiedCalendarEvent[] => {
    let filtered = events;
    if (query.eventType) filtered = filtered.filter((event) => event.eventType === query.eventType);
    if (query.status) filtered = filtered.filter((event) => event.status === query.status);
    if (query.vehicleId) filtered = filtered.filter((event) => event.relatedVehicleIds.includes(query.vehicleId as string));
    if (query.guideId) {
        filtered = filtered.filter((event) => {
            const guideIds = (event.metadata as any)?.guideIds as string[] | undefined;
            return guideIds ? guideIds.includes(query.guideId as string) : event.relatedStaffIds.includes(query.guideId as string);
        });
    }
    if (query.driverId) {
        filtered = filtered.filter((event) => {
            const driverIds = (event.metadata as any)?.driverIds as string[] | undefined;
            return driverIds ? driverIds.includes(query.driverId as string) : event.relatedStaffIds.includes(query.driverId as string);
        });
    }
    return filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
};

export async function getUnifiedCalendarEvents(query: CalendarEventsQuery): Promise<UnifiedCalendarEvent[]> {
    const departures = await fetchDeparturesInRange(query);
    const departureIds = departures.map((d: any) => d._id);
    const [assignments, bookings, packageDocs] = await Promise.all([
        fetchAssignmentsInRange(query, departureIds),
        fetchBookingsInRange(query, departureIds),
        Tour.find({ _id: { $in: departures.map((d: any) => d.packageId) } }).select('_id title').lean(),
    ]);

    const vehicleIds = bookings
        .map((b: any) => b.assignedVehicle?._id || b.assignedVehicle)
        .filter(Boolean);
    const vehicleDocs = vehicleIds.length
        ? await Car.find({ _id: { $in: vehicleIds } }).select('_id brand carModel seats').lean()
        : [];

    const packageNameMap = new Map<string, string>(
        packageDocs.map((pkg: any) => [String(pkg._id), String(pkg.title || 'Departure')]),
    );
    const vehicleNameMap = new Map<string, { name: string; seats: number }>(
        vehicleDocs.map((v: any) => [String(v._id), { name: `${v.brand} ${v.carModel || ''}`.trim(), seats: Number(v.seats || 0) }]),
    );

    const assignmentsByDeparture = new Map<string, any[]>();
    assignments.forEach((row: any) => {
        const key = String(row.departureId);
        const list = assignmentsByDeparture.get(key) || [];
        list.push(row);
        assignmentsByDeparture.set(key, list);
    });

    const bookingsByDeparture = new Map<string, any[]>();
    bookings.forEach((row: any) => {
        if (!row.departureId) return;
        const key = String(row.departureId);
        const list = bookingsByDeparture.get(key) || [];
        list.push(row);
        bookingsByDeparture.set(key, list);
    });

    const events: UnifiedCalendarEvent[] = [];

    departures.forEach((departure: any) => {
        const departureId = String(departure._id);
        const packageName = packageNameMap.get(String(departure.packageId)) || 'Departure';
        const departureAssignments = assignmentsByDeparture.get(departureId) || [];
        const departureBookings = bookingsByDeparture.get(departureId) || [];
        const { occupied, capacity, available } = seatNumbers(departure);
        const guideIds = departureAssignments
            .filter((a: any) => a.role === 'guide' && a.status === 'active')
            .map((a: any) => String(a.staffId?._id || a.staffId));
        const driverIds = departureAssignments
            .filter((a: any) => a.role === 'driver' && a.status === 'active')
            .map((a: any) => String(a.staffId?._id || a.staffId));
        const hasGuide = guideIds.length > 0;
        const hasDriver = driverIds.length > 0;
        const vehicleIds = Array.from(
            new Set(
                departureBookings
                    .map((b: any) => b.assignedVehicle?._id || b.assignedVehicle)
                    .filter(Boolean)
                    .map(String),
            ),
        );
        const hasVehicle = vehicleIds.length > 0;
        const overbooked = occupied > capacity;
        const readiness = deriveDepartureReadiness({ hasGuide, hasDriver, hasVehicle, overbooked });

        events.push({
            id: `departure:${departureId}`,
            eventType: 'departure',
            title: `${packageName} departure`,
            start: new Date(departure.startsAt).toISOString(),
            end: new Date(departure.endsAt || departure.startsAt).toISOString(),
            status: String(departure.status),
            severity: readiness === 'blocked' ? 'high' : readiness === 'partial' ? 'medium' : 'low',
            relatedDepartureId: departureId,
            relatedStaffIds: departureAssignments.map((a: any) => String(a.staffId?._id || a.staffId)),
            relatedVehicleIds: vehicleIds,
            alerts: [],
            metadata: {
                packageId: String(departure.packageId),
                readiness,
                capacity,
                bookedSeats: occupied,
                availableSeats: available,
                hasGuideAssigned: hasGuide,
                hasDriverAssigned: hasDriver,
                hasVehicleAssigned: hasVehicle,
                guideIds,
                driverIds,
            },
        });

        if (!hasGuide) {
            events.push(buildOperationalAlerts({
                departureId,
                title: 'Departure missing guide assignment',
                start: departure.startsAt,
                end: departure.endsAt || departure.startsAt,
                severity: 'high',
                code: 'NO_GUIDE_ASSIGNED',
                message: 'No guide assigned to departure',
                relatedVehicleIds: vehicleIds,
            }));
        }

        if (!hasVehicle) {
            events.push(buildOperationalAlerts({
                departureId,
                title: 'Departure missing vehicle allocation',
                start: departure.startsAt,
                end: departure.endsAt || departure.startsAt,
                severity: 'high',
                code: 'NO_VEHICLE_ASSIGNED',
                message: 'No vehicle allocated to departure',
            }));
        }

        if (overbooked) {
            events.push(buildOperationalAlerts({
                departureId,
                title: 'Departure overbooked',
                start: departure.startsAt,
                end: departure.endsAt || departure.startsAt,
                severity: 'critical',
                code: 'OVERBOOKED_DEPARTURE',
                message: 'Booked seats exceed departure capacity',
                relatedStaffIds: departureAssignments.map((a: any) => String(a.staffId?._id || a.staffId)),
                relatedVehicleIds: vehicleIds,
            }));
        }
    });

    assignments.forEach((assignment: any) => {
        const staffId = String(assignment.staffId?._id || assignment.staffId);
        const departureId = String(assignment.departureId);
        if (assignment.role === 'guide' && query.guideId && query.guideId !== staffId) return;
        if (assignment.role === 'driver' && query.driverId && query.driverId !== staffId) return;

        events.push({
            id: `staff:${assignment._id}`,
            eventType: 'staff_assignment',
            title: `${assignment.staffId?.fullName || 'Staff'} (${assignment.role})`,
            start: new Date(assignment.startDate).toISOString(),
            end: new Date(assignment.endDate).toISOString(),
            status: String(assignment.status || 'active'),
            severity: assignment.status === 'cancelled' ? 'high' : 'low',
            relatedDepartureId: departureId,
            relatedStaffIds: [staffId],
            relatedVehicleIds: [],
            alerts: [],
            metadata: { role: assignment.role },
        });
    });

    bookings.forEach((booking: any) => {
        const bookingStatus = normalizeBookingStatus(booking);
        const bookingStart = booking.startDate || booking.checkInDate || booking.bookingDate || booking.createdAt;
        const bookingEnd = booking.endDate || booking.checkOutDate || bookingStart;
        const departureId = booking.departureId ? String(booking.departureId) : undefined;
        const vehicleId = booking.assignedVehicle?._id || booking.assignedVehicle;
        const vehicleIdStr = vehicleId ? String(vehicleId) : undefined;

        const serviceTitle =
            booking.tour?.title ||
            booking.lodge?.name ||
            (booking.car?.brand ? `${booking.car.brand} ${booking.car.carModel || ''}`.trim() : '') ||
            'Booking';
        const guestName = `${booking.user?.first_name || ''} ${booking.user?.last_name || ''}`.trim() || 'Guest';
        const people = Number(booking.numberOfPeople || 1);

        events.push({
            id: `booking:${booking._id}`,
            eventType: 'booking',
            title: `${serviceTitle} - ${guestName}`,
            start: new Date(bookingStart).toISOString(),
            end: new Date(bookingEnd).toISOString(),
            status: bookingStatus,
            severity: severityByStatus(bookingStatus),
            relatedDepartureId: departureId,
            relatedBookingId: String(booking._id),
            relatedStaffIds: booking.assignedGuide ? [String(booking.assignedGuide)] : [],
            relatedVehicleIds: vehicleIdStr ? [vehicleIdStr] : [],
            alerts: [],
            metadata: {
                bookingType: booking.bookingType,
                passengerCount: people,
                pendingApproval: isPendingBookingStatus(bookingStatus),
            },
        });

        if (isPendingBookingStatus(bookingStatus)) {
            events.push(buildOperationalAlerts({
                departureId,
                bookingId: String(booking._id),
                title: 'Pending booking approval',
                start: bookingStart,
                end: bookingEnd,
                severity: 'medium',
                code: 'PENDING_BOOKING_APPROVAL',
                message: 'Booking requires operational approval',
                relatedVehicleIds: vehicleIdStr ? [vehicleIdStr] : [],
            }));
        }
    });

    events.push(...buildVehicleAllocationEvents(bookings, vehicleNameMap));

    return applyEventFilters(events, query);
}
