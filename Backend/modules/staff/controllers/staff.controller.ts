import asyncHandler from 'express-async-handler';
import {
    createStaff,
    getStaffById,
    listStaff,
    setStaffActiveStatus,
    updateStaff,
} from '../services/staff.service';

export const createStaffHandler = asyncHandler(async (req: any, res: any) => {
    const staff = await createStaff(req.body, req.user?._id);
    res.status(201).json(staff);
});

export const updateStaffHandler = asyncHandler(async (req: any, res: any) => {
    const staff = await updateStaff(req.params.id, req.body, req.user?._id);
    if (!staff) {
        res.status(404);
        throw new Error('Staff not found');
    }
    res.status(200).json(staff);
});

export const getStaffByIdHandler = asyncHandler(async (req: any, res: any) => {
    const staff = await getStaffById(req.params.id);
    if (!staff) {
        res.status(404);
        throw new Error('Staff not found');
    }
    res.status(200).json(staff);
});

export const listStaffHandler = asyncHandler(async (req: any, res: any) => {
    const { role, availability, status, search } = req.query as Record<string, string | undefined>;
    const data = await listStaff({
        role: role as any,
        availability: availability as any,
        status: status as any,
        search,
    });
    res.status(200).json(data);
});

export const deactivateStaffHandler = asyncHandler(async (req: any, res: any) => {
    const updated = await setStaffActiveStatus(req.params.id, 'inactive', req.user?._id);
    if (!updated) {
        res.status(404);
        throw new Error('Staff not found');
    }
    res.status(200).json(updated);
});

export const activateStaffHandler = asyncHandler(async (req: any, res: any) => {
    const updated = await setStaffActiveStatus(req.params.id, 'active', req.user?._id);
    if (!updated) {
        res.status(404);
        throw new Error('Staff not found');
    }
    res.status(200).json(updated);
});
