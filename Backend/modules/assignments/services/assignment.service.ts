import mongoose from 'mongoose';
import Assignment, { AssignmentRole, IAssignment } from '../models/assignment.model';
import Staff from '../../staff/models/staff.model';
import PackageDeparture from '../../packages/models/packageDepartureModel';
import { createAuditLog } from '../../../utils/auditLogger';

export class StaffConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'StaffConflictError';
    }
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
    return aStart <= bEnd && bStart <= aEnd;
}

export async function assertAssignmentAvailability(params: {
    staffId: string;
    role: AssignmentRole;
    startDate: Date;
    endDate: Date;
    excludeAssignmentId?: string;
}) {
    const staff = await Staff.findById(params.staffId);
    if (!staff || staff.status !== 'active') {
        throw new StaffConflictError('Selected staff member is inactive or not found');
    }
    if (staff.role !== params.role) {
        throw new StaffConflictError(`Selected staff role mismatch. Expected ${params.role}`);
    }
    if (staff.availability === 'unavailable' || staff.availability === 'on_leave') {
        throw new StaffConflictError('Selected staff member is unavailable');
    }

    const existing = await Assignment.find({
        staffId: params.staffId,
        status: 'active',
        ...(params.excludeAssignmentId ? { _id: { $ne: params.excludeAssignmentId } } : {}),
    });
    const hasConflict = existing.some((row) =>
        overlaps(params.startDate, params.endDate, new Date(row.startDate), new Date(row.endDate))
    );
    if (hasConflict) {
        throw new StaffConflictError(
            `${params.role === 'guide' ? 'Guide' : 'Driver'} is already assigned to another departure`
        );
    }
    return staff;
}

export async function assignStaffToDeparture(params: {
    staffId: string;
    role: AssignmentRole;
    departureId: string;
    bookingId?: string;
    customTripId?: string;
    startDate?: Date;
    endDate?: Date;
    actorId?: mongoose.Types.ObjectId;
    ip?: string;
    userAgent?: string;
}) {
    const departure = await PackageDeparture.findById(params.departureId);
    if (!departure) {
        throw new Error('Departure not found');
    }
    const startDate = params.startDate || new Date(departure.startsAt);
    const endDate = params.endDate || new Date(departure.endsAt || departure.startsAt);
    const staff = await assertAssignmentAvailability({
        staffId: params.staffId,
        role: params.role,
        startDate,
        endDate,
    });

    const assignment = await Assignment.create({
        staffId: staff._id,
        role: params.role,
        departureId: departure._id,
        bookingId: params.bookingId,
        customTripId: params.customTripId,
        startDate,
        endDate,
        status: 'active',
        assignedBy: params.actorId,
    });

    staff.availability = 'assigned';
    staff.currentAssignmentsCount = (staff.currentAssignmentsCount || 0) + 1;
    staff.lastAssignedAt = new Date();
    await staff.save();

    await createAuditLog({
        user: params.actorId,
        action: 'Created staff assignment',
        actionType: 'SYSTEM',
        resource: 'Assignment',
        resourceId: String(assignment._id),
        details: `${params.role} assigned to departure ${params.departureId}`,
        status: 'success',
        ip: params.ip,
        userAgent: params.userAgent,
        actorRole: 'admin',
        metadata: {
            staffId: params.staffId,
            departureId: params.departureId,
            bookingId: params.bookingId,
            customTripId: params.customTripId,
        },
    });

    return assignment;
}

export async function removeAssignment(params: {
    assignmentId: string;
    actorId?: mongoose.Types.ObjectId;
    reason?: string;
    ip?: string;
    userAgent?: string;
}) {
    const assignment = await Assignment.findById(params.assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    if (assignment.status === 'cancelled') return assignment;

    assignment.status = 'cancelled';
    assignment.cancelledBy = params.actorId;
    assignment.cancellationReason = params.reason;
    await assignment.save();

    const activeCount = await Assignment.countDocuments({
        staffId: assignment.staffId,
        status: 'active',
    });
    const staff = await Staff.findById(assignment.staffId);
    if (staff) {
        staff.currentAssignmentsCount = activeCount;
        staff.availability = activeCount > 0 ? 'assigned' : 'available';
        await staff.save();
    }

    await createAuditLog({
        user: params.actorId,
        action: 'Cancelled staff assignment',
        actionType: 'SYSTEM',
        resource: 'Assignment',
        resourceId: String(assignment._id),
        details: `Assignment cancelled${params.reason ? `: ${params.reason}` : ''}`,
        status: 'warning',
        ip: params.ip,
        userAgent: params.userAgent,
        actorRole: 'admin',
        metadata: { staffId: String(assignment.staffId), departureId: String(assignment.departureId) },
    });

    return assignment;
}

export async function getStaffSchedule(staffId: string): Promise<IAssignment[]> {
    return Assignment.find({ staffId }).sort({ startDate: 1 }).populate('departureId').populate('staffId');
}

export async function getDepartureAssignments(departureId: string): Promise<IAssignment[]> {
    return Assignment.find({ departureId, status: 'active' }).populate('staffId').sort({ role: 1 });
}

export function assignmentToCalendarEvent(assignment: IAssignment & { staffId?: any }) {
    const staffName = assignment.staffId?.fullName || 'Staff';
    return {
        id: String(assignment._id),
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        title: `${staffName} (${assignment.role})`,
        role: assignment.role,
        staffId: assignment.staffId?._id || assignment.staffId,
        departureId: assignment.departureId,
        status: assignment.status,
    };
}
