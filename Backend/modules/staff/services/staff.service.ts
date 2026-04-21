import mongoose from 'mongoose';
import Staff, { IStaff, StaffAvailability, StaffRole, StaffStatus } from '../models/staff.model';

export const STAFF_PERMISSIONS = ['staff.view', 'staff.create', 'staff.edit', 'staff.manage'] as const;

type CreateStaffInput = {
    fullName: string;
    email?: string;
    phone?: string;
    avatar?: string;
    role: StaffRole;
    availability?: StaffAvailability;
    status?: StaffStatus;
    skills?: IStaff['skills'];
    hireDate?: Date | string;
    notes?: string;
};

type UpdateStaffInput = Partial<CreateStaffInput> & {
    currentAssignmentsCount?: number;
    lastAssignedAt?: Date | string;
};

export async function createStaff(input: CreateStaffInput, actorId?: mongoose.Types.ObjectId): Promise<IStaff> {
    const staff = await Staff.create({
        ...input,
        hireDate: input.hireDate ? new Date(input.hireDate) : undefined,
        createdBy: actorId,
        updatedBy: actorId,
    });
    return staff;
}

export async function updateStaff(
    staffId: string,
    input: UpdateStaffInput,
    actorId?: mongoose.Types.ObjectId
): Promise<IStaff | null> {
    const updateDoc: Record<string, unknown> = {
        ...input,
        updatedBy: actorId,
    };
    if (input.hireDate) updateDoc.hireDate = new Date(input.hireDate);
    if (input.lastAssignedAt) updateDoc.lastAssignedAt = new Date(input.lastAssignedAt);
    return Staff.findByIdAndUpdate(staffId, updateDoc, { new: true });
}

export async function getStaffById(staffId: string): Promise<IStaff | null> {
    return Staff.findById(staffId);
}

export async function listStaff(filters?: {
    role?: StaffRole;
    availability?: StaffAvailability;
    status?: StaffStatus;
    search?: string;
}) {
    const query: Record<string, unknown> = {};
    if (filters?.role) query.role = filters.role;
    if (filters?.availability) query.availability = filters.availability;
    if (filters?.status) query.status = filters.status;
    if (filters?.search?.trim()) {
        query.$or = [
            { fullName: new RegExp(filters.search.trim(), 'i') },
            { email: new RegExp(filters.search.trim(), 'i') },
            { phone: new RegExp(filters.search.trim(), 'i') },
        ];
    }
    return Staff.find(query).sort({ createdAt: -1 });
}

export async function setStaffActiveStatus(
    staffId: string,
    status: StaffStatus,
    actorId?: mongoose.Types.ObjectId
): Promise<IStaff | null> {
    const update: Record<string, unknown> = { status, updatedBy: actorId };
    if (status === 'inactive') {
        update.availability = 'unavailable';
    }
    return Staff.findByIdAndUpdate(staffId, update, { new: true });
}
