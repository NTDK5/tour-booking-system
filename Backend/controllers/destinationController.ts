import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Destination from '../models/destinationModel';

// @desc Get all destinations
// @route GET /api/destinations
// @access Public
export const getDestinations = asyncHandler(async (_req: Request, res: Response) => {
    const destinations = await Destination.find({}).sort({ name: 1 });
    res.json(destinations);
});

// @desc Get destination by id
// @route GET /api/destinations/:id
// @access Public
export const getDestinationById = asyncHandler(async (req: Request, res: Response) => {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
        res.status(404);
        throw new Error('Destination not found');
    }
    res.json(destination);
});

// @desc Create destination
// @route POST /api/destinations
// @access Private/Admin
export const createDestination = asyncHandler(async (req: Request, res: Response) => {
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);
});

// @desc Update destination
// @route PUT /api/destinations/:id
// @access Private/Admin
export const updateDestination = asyncHandler(async (req: Request, res: Response) => {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
        res.status(404);
        throw new Error('Destination not found');
    }
    Object.assign(destination, req.body);
    const updated = await destination.save();
    res.json(updated);
});

// @desc Delete destination
// @route DELETE /api/destinations/:id
// @access Private/Admin
export const deleteDestination = asyncHandler(async (req: Request, res: Response) => {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
        res.status(404);
        throw new Error('Destination not found');
    }
    await destination.deleteOne();
    res.json({ message: 'Destination removed' });
});
