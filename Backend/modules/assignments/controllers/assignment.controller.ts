import asyncHandler from 'express-async-handler';
import {
    assignStaffToDeparture,
    assignmentToCalendarEvent,
    getDepartureAssignments,
    getStaffSchedule,
    removeAssignment,
    StaffConflictError,
} from '../services/assignment.service';

export const createAssignment = asyncHandler(async (req: any, res: any) => {
    try {
        const assignment = await assignStaffToDeparture({
            staffId: req.body.staffId,
            role: req.body.role,
            departureId: req.body.departureId,
            bookingId: req.body.bookingId,
            customTripId: req.body.customTripId,
            startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
            endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
            actorId: req.user?._id,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.status(201).json(assignment);
    } catch (error: any) {
        if (error instanceof StaffConflictError) {
            return res.status(409).json({
                error: 'STAFF_CONFLICT',
                message: error.message,
            });
        }
        throw error;
    }
});

export const cancelAssignment = asyncHandler(async (req: any, res: any) => {
    const cancelled = await removeAssignment({
        assignmentId: req.params.id,
        actorId: req.user?._id,
        reason: req.body?.reason,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    res.status(200).json(cancelled);
});

export const listStaffSchedule = asyncHandler(async (req: any, res: any) => {
    const rows = await getStaffSchedule(req.params.id);
    res.status(200).json({
        assignments: rows,
        events: rows.map((r) => assignmentToCalendarEvent(r as any)),
    });
});

export const listDepartureAssignments = asyncHandler(async (req: any, res: any) => {
    const rows = await getDepartureAssignments(req.params.id);
    res.status(200).json({
        assignments: rows,
        events: rows.map((r) => assignmentToCalendarEvent(r as any)),
    });
});
