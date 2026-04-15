import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Booking from '../models/bookingModel';
import Lodge from '../models/lodgeModel';
import Tour from '../models/tourModel';
import Car from '../models/carModel';
import Availability from '../models/availabilityModel';
import User from '../models/userModel';
import Log from '../models/logModel';
import Resource from '../models/resourceModel';
import { checkResourceAvailability, getBookingsForCalendarRange } from '../services/resourceAvailabilityService';
import { startOfDay, endOfDay, subDays, format, startOfMonth, endOfMonth } from 'date-fns';
import { createAuditLog } from '../utils/auditLogger';

const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

const parseDate = (d: any): Date | null => {
    if (!d || d === 'undefined' || d === 'null' || d === '') return null;
    const date = new Date(d as string);
    return isValidDate(date) ? date : null;
};

// @desc Get dashboard statistics
// @route GET /api/admin/stats
// @access Private/Admin
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfTodayAt = endOfDay(today);

    // Today's bookings
    const todayBookingsCount = await Booking.countDocuments({
        createdAt: { $gte: startOfToday, $lte: endOfTodayAt }
    });

    // Upcoming check-ins (next 7 days)
    const sevenDaysLater = endOfDay(subDays(today, -7));
    const upcomingCheckins = await Booking.find({
        $or: [
            { checkInDate: { $gte: startOfToday, $lte: sevenDaysLater } },
            { bookingDate: { $gte: startOfToday, $lte: sevenDaysLater } }
        ],
        status: { $in: ['pending', 'confirmed'] }
    }).populate('user', 'first_name last_name email').populate('tour lodge car');

    // Revenue summary (last 30 days)
    const thirtyDaysAgo = startOfDay(subDays(today, 30));
    const revenueStats = await Booking.aggregate([
        {
            $match: {
                createdAt: { $gte: thirtyDaysAgo },
                status: 'confirmed'
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' },
                count: { $sum: 1 }
            }
        }
    ]);

    // Booking trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, i);
        return format(d, 'yyyy-MM-dd');
    }).reverse();

    const bookingTrendsAggregate = await Booking.aggregate([
        {
            $match: {
                createdAt: { $gte: subDays(startOfToday, 6) }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const bookingTrends = last7Days.map(date => ({
        date,
        count: bookingTrendsAggregate.find(b => b._id === date)?.count || 0
    }));

    res.json({
        todayBookings: todayBookingsCount,
        upcomingCheckinsCount: upcomingCheckins.length,
        upcomingCheckins,
        revenue: revenueStats[0]?.totalRevenue || 0,
        bookingTrends
    });
});

// @desc Get availability for resource
// @route GET /api/admin/availability
// @access Private/Admin
export const getAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { start, end, resourceType, resourceId } = req.query;

    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (!startDate || !endDate) {
        res.status(400);
        throw new Error('Please provide valid start and end dates');
    }

    const query: any = {
        date: {
            $gte: startOfDay(startDate),
            $lte: endOfDay(endDate)
        }
    };

    if (resourceType) query.resourceType = resourceType;
    if (resourceId) query.resourceId = resourceId;

    const availability = await Availability.find(query);
    res.json(availability);
});

// @desc Block or Unblock dates
// @route POST /api/admin/availability
// @access Private/Admin
export const updateAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { resourceId, resourceType, date, status, notes, totalCapacity } = req.body;

    if (!resourceId || !resourceType || !date || !status) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // If totalCapacity is not provided, try to fetch it from the resource
    let resolvedCapacity = totalCapacity;
    if (!resolvedCapacity) {
        if (resourceType === 'Lodge') {
            const lodge = await Lodge.findById(resourceId);
            // This is a simplification; capacity might depend on room type
            resolvedCapacity = lodge?.roomTypes?.[0]?.availableRooms || 10;
        } else if (resourceType === 'Tour') {
            resolvedCapacity = 20; // Default tour capacity
        } else if (resourceType === 'Car') {
            resolvedCapacity = 1; // Cars are usually 1
        }
    }

    const parsedDate = parseDate(date);
    if (!parsedDate) {
        res.status(400);
        throw new Error('Invalid date format');
    }

    const availability = await Availability.findOneAndUpdate(
        {
            resourceId,
            resourceType,
            date: startOfDay(parsedDate)
        },
        {
            status,
            notes,
            totalCapacity: resolvedCapacity || 10
        },
        { upsert: true, new: true }
    );

    await createAuditLog({
        user: (req as any).user?._id,
        action: 'Updated availability',
        actionType: 'AVAILABILITY',
        resource: resourceType,
        resourceId: String(resourceId),
        details: `${resourceType} availability set to ${status} on ${format(startOfDay(parsedDate), 'yyyy-MM-dd')}`,
        status: 'info',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        actorRole: 'admin',
        metadata: {
            date: startOfDay(parsedDate),
            notes,
            totalCapacity: resolvedCapacity || 10,
        },
    });

    res.json(availability);
});

// @desc Create manual (offline) booking
// @route POST /api/admin/bookings/offline
// @access Private/Admin
export const createOfflineBooking = asyncHandler(async (req: Request, res: Response) => {
    const {
        userEmail,
        userName,
        bookingType,
        resourceId,
        numberOfPeople,
        totalPrice,
        paymentStatus,
        paymentMethod,
        checkInDate,
        checkOutDate,
        bookingDate,
        internalNotes,
        roomType
    } = req.body;

    // Find or create user for manual booking
    let user = await User.findOne({ email: userEmail });
    if (!user) {
        // Create a skeleton user or handle accordingly
        // For now, let's assume we need an email
        user = await User.create({
            email: userEmail,
            first_name: userName.split(' ')[0] || 'Guest',
            last_name: userName.split(' ')[1] || 'Manual',
            role: 'user',
            // Manual bookings might not have a password, but model might require it
            password: Math.random().toString(36).slice(-8),
            isVerified: true
        });
    }

    const bookingData: any = {
        user: user._id,
        bookingType,
        numberOfPeople,
        totalPrice,
        paymentStatus: paymentStatus || 'unpaid',
        paymentMethod: paymentMethod || 'cash',
        source: 'offline',
        internalNotes,
        history: [{
            status: 'confirmed', // Manual bookings are usually confirmed immediately
            timestamp: new Date(),
            comment: 'Manual booking created by admin'
        }]
    };

    if (bookingType === 'Lodge') {
        bookingData.lodge = resourceId;
        bookingData.checkInDate = checkInDate;
        bookingData.checkOutDate = checkOutDate;
        bookingData.roomType = roomType;
    } else if (bookingType === 'Tour') {
        bookingData.tour = resourceId;
        bookingData.bookingDate = bookingDate;
    } else if (bookingType === 'Car') {
        bookingData.car = resourceId;
        bookingData.checkInDate = checkInDate;
        bookingData.checkOutDate = checkOutDate;
    }

    const booking = await Booking.create(bookingData);

    // Update availability
    // TODO: Implement a helper to update Availability records based on booking

    res.status(201).json(booking);

    // Dynamic Log
    await createAuditLog({
        user: (req as any).user?._id,
        action: 'Created offline booking',
        actionType: 'BOOKING',
        resource: bookingType,
        resourceId: String(booking._id),
        details: `Guest: ${userName}, Total: $${totalPrice}`,
        status: 'success',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        actorRole: 'admin',
        metadata: {
            source: 'offline',
            paymentMethod,
            paymentStatus,
        },
    });
});

// @desc Get reports
// @route GET /api/admin/reports
// @access Private/Admin
export const getReports = asyncHandler(async (req: Request, res: Response) => {
    const { type, start, end } = req.query;

    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (type === 'occupancy' && startDate && endDate) {
        const bookings = await Booking.find({
            bookingType: 'Lodge',
            status: 'confirmed',
            $or: [
                { checkInDate: { $gte: startOfDay(startDate), $lte: endOfDay(endDate) } },
                { checkOutDate: { $gte: startOfDay(startDate), $lte: endOfDay(endDate) } }
            ]
        });
        res.json(bookings);
    } else if (type === 'revenue' && startDate && endDate) {
        const stats = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay(startDate), $lte: endOfDay(endDate) },
                    status: 'confirmed'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(stats);
    } else {
        const query: any = {};
        if (startDate && endDate) {
            query.createdAt = { $gte: startOfDay(startDate), $lte: endOfDay(endDate) };
        }

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('user', 'first_name last_name email')
            .populate('tour lodge car');
        res.json(bookings);
    }
});

// @desc Get activity logs
// @route GET /api/admin/logs
// @access Private/Admin
export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
    const { search, status, actionType, actorRole, resource, limit = '50' } = req.query as Record<string, string>;
    const query: any = {};

    if (status) query.status = status;
    if (actionType) query.actionType = actionType;
    if (actorRole) query.actorRole = actorRole;
    if (resource) query.resource = resource;
    if (search) {
        query.$or = [
            { action: { $regex: search, $options: 'i' } },
            { details: { $regex: search, $options: 'i' } },
            { resource: { $regex: search, $options: 'i' } },
        ];
    }

    const safeLimit = Math.min(Math.max(parseInt(limit || '50', 10), 1), 200);
    const logs = await Log.find(query)
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .populate('user', 'first_name last_name email');
    res.json(logs);
});

// @desc List unified resources
// @route GET /api/admin/resources
// @access Private/Admin
export const getResources = asyncHandler(async (req: Request, res: Response) => {
    const { resourceType, search } = req.query as Record<string, string>;
    const query: any = { isActive: true };
    if (resourceType) query.resourceType = resourceType;
    if (search) query.name = { $regex: search, $options: 'i' };

    const resources = await Resource.find(query).sort({ resourceType: 1, name: 1 });
    res.json(resources);
});

// @desc Sync resources from existing domain models
// @route POST /api/admin/resources/sync
// @access Private/Admin
export const syncResources = asyncHandler(async (_req: Request, res: Response) => {
    const [lodges, tours, cars] = await Promise.all([
        Lodge.find({}).lean(),
        Tour.find({}).lean(),
        Car.find({}).lean(),
    ]);

    const ops: any[] = [];
    lodges.forEach((lodge: any) => {
        ops.push({
            updateOne: {
                filter: { sourceModel: 'Lodge', sourceId: lodge._id },
                update: {
                    $set: {
                        resourceType: 'Lodge',
                        sourceModel: 'Lodge',
                        sourceId: lodge._id,
                        name: lodge.name,
                        metadata: { location: lodge.location, roomTypes: lodge.roomTypes || [] },
                        constraints: { maxCapacity: 20 },
                        isActive: true,
                    }
                },
                upsert: true,
            }
        });
    });
    tours.forEach((tour: any) => {
        ops.push({
            updateOne: {
                filter: { sourceModel: 'Tour', sourceId: tour._id },
                update: {
                    $set: {
                        resourceType: 'Tour',
                        sourceModel: 'Tour',
                        sourceId: tour._id,
                        name: tour.title,
                        metadata: { destination: tour.destination, duration: tour.duration },
                        constraints: { maxCapacity: 20 },
                        isActive: true,
                    }
                },
                upsert: true,
            }
        });
    });
    cars.forEach((car: any) => {
        ops.push({
            updateOne: {
                filter: { sourceModel: 'Car', sourceId: car._id },
                update: {
                    $set: {
                        resourceType: 'Car',
                        sourceModel: 'Car',
                        sourceId: car._id,
                        name: `${car.brand} ${car.carModel || car.model || ''}`.trim(),
                        metadata: { location: car.location, seats: car.seats },
                        constraints: { maxCapacity: 1 },
                        isActive: Boolean(car.available),
                    }
                },
                upsert: true,
            }
        });
    });

    if (ops.length) {
        await Resource.bulkWrite(ops);
    }

    res.json({ message: 'Resources synced', total: ops.length });
});

// @desc Unified calendar bookings source
// @route GET /api/admin/calendar/bookings
// @access Private/Admin
export const getUnifiedCalendarBookings = asyncHandler(async (req: Request, res: Response) => {
    const { start, end, resourceType, resourceId } = req.query as Record<string, string>;
    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (!startDate || !endDate) {
        res.status(400);
        throw new Error('Please provide valid start and end date');
    }

    const data = await getBookingsForCalendarRange(
        { startDate, endDate },
        { resourceType, resourceId }
    );
    res.json(data);
});

// @desc Check unified resource availability
// @route POST /api/admin/calendar/check-availability
// @access Private/Admin
export const checkUnifiedResourceAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { resourceId, resourceType, startDate, endDate, excludeBookingId } = req.body;
    if (!resourceId || !resourceType || !startDate || !endDate) {
        res.status(400);
        throw new Error('resourceId, resourceType, startDate, and endDate are required');
    }

    const result = await checkResourceAvailability(
        { resourceId, resourceType },
        { startDate: new Date(startDate), endDate: new Date(endDate) },
        excludeBookingId
    );

    res.json(result);
});
