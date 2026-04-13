import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Lodge from '../models/lodgeModel';

// @desc Get all lodges
export const getLodges = asyncHandler(async (req: Request, res: Response) => {
    const lodges = await Lodge.find({});
    res.json(lodges);
});

// @desc Get lodge by ID
export const getLodgeById = asyncHandler(async (req: Request, res: Response) => {
    const lodge = await Lodge.findById(req.params.id);
    if (lodge) {
        res.json(lodge);
    } else {
        res.status(404);
        throw new Error('Lodge not found');
    }
});

// @desc Create a lodge
export const createLodge = asyncHandler(async (req: Request, res: Response) => {
    const lodge = new Lodge(req.body);
    const createdLodge = await lodge.save();
    res.status(201).json(createdLodge);
});

// @desc Update a lodge
export const updateLodge = asyncHandler(async (req: Request, res: Response) => {
    const lodge = await Lodge.findById(req.params.id);
    if (lodge) {
        Object.assign(lodge, req.body);
        const updatedLodge = await lodge.save();
        res.json(updatedLodge);
    } else {
        res.status(404);
        throw new Error('Lodge not found');
    }
});

// @desc Delete a lodge
export const deleteLodge = asyncHandler(async (req: Request, res: Response) => {
    const lodge = await Lodge.findById(req.params.id);
    if (lodge) {
        await lodge.deleteOne();
        res.json({ message: 'Lodge removed' });
    } else {
        res.status(404);
        throw new Error('Lodge not found');
    }
});
