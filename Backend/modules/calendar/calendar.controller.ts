import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getUnifiedCalendarEvents } from './calendar.service';
import type { CalendarEventType, UnifiedCalendarEventsResponse } from './calendar.types';

const parseDate = (input?: string): Date | null => {
    if (!input) return null;
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? null : date;
};

const isCalendarEventType = (value?: string): value is CalendarEventType =>
    value === 'departure' ||
    value === 'booking' ||
    value === 'staff_assignment' ||
    value === 'vehicle_assignment' ||
    value === 'operational_alert';

export const listUnifiedCalendarEvents = asyncHandler(async (req: Request, res: Response) => {
    const {
        start,
        end,
        packageId,
        guideId,
        driverId,
        vehicleId,
        status,
        eventType,
    } = req.query as Record<string, string | undefined>;

    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (!startDate || !endDate) {
        res.status(400);
        throw new Error('start and end query params are required in valid date format');
    }
    if (startDate > endDate) {
        res.status(400);
        throw new Error('start must be less than or equal to end');
    }

    const events = await getUnifiedCalendarEvents({
        startDate,
        endDate,
        packageId,
        guideId,
        driverId,
        vehicleId,
        status,
        eventType: isCalendarEventType(eventType) ? eventType : undefined,
    });

    const payload: UnifiedCalendarEventsResponse = {
        range: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
        },
        total: events.length,
        events,
    };

    res.json(payload);
});
