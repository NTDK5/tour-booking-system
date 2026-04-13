import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Activity from '../models/activityModel';

// @desc Get all activities
// @route GET /api/activities
// @access Public
export const getActivities = asyncHandler(async (req: Request, res: Response) => {
    const { destinationId } = req.query;
    const query: any = {};
    if (destinationId) query.destination = destinationId;

    const activities = await Activity.find(query)
        .populate('destination', 'name region')
        .sort({ createdAt: -1 });
    res.json(activities);
});

// @desc Get activity by id
// @route GET /api/activities/:id
// @access Public
export const getActivityById = asyncHandler(async (req: Request, res: Response) => {
    const activity = await Activity.findById(req.params.id).populate('destination', 'name region');
    if (!activity) {
        res.status(404);
        throw new Error('Activity not found');
    }
    res.json(activity);
});

// @desc Create activity
// @route POST /api/activities
// @access Private/Admin
export const createActivity = asyncHandler(async (req: Request, res: Response) => {
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
});

// @desc Update activity
// @route PUT /api/activities/:id
// @access Private/Admin
export const updateActivity = asyncHandler(async (req: Request, res: Response) => {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
        res.status(404);
        throw new Error('Activity not found');
    }
    Object.assign(activity, req.body);
    const updated = await activity.save();
    res.json(updated);
});

// @desc Delete activity
// @route DELETE /api/activities/:id
// @access Private/Admin
export const deleteActivity = asyncHandler(async (req: Request, res: Response) => {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
        res.status(404);
        throw new Error('Activity not found');
    }
    await activity.deleteOne();
    res.json({ message: 'Activity removed' });
});
