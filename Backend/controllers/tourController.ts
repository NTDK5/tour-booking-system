import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Tour from '../models/tourModel';

// @desc Get all tours (with optional filters)
// @route GET /api/tours
export const getTours = asyncHandler(async (req: Request, res: Response) => {
    const {
        featured,
        limit = 20,
        page = 1,
        category,
        destination,
        days,
        duration,
        difficulty,
        minPrice,
        maxPrice,
        sort = '-averageRating',
        search,
    } = req.query;

    const limitNum = Math.min(Number(limit), 100);
    const pageNum = Math.max(Number(page), 1);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: Record<string, any> = {};

    if (category) filter.category = category;
    if (destination) filter.destination = { $regex: destination, $options: 'i' };
    if (days || duration) filter.duration = Number(days || duration);
    if (difficulty) filter.difficulty = difficulty;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { destination: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    // Handle featured: if featured=true, try to find featured tours first,
    // fall back to top-rated tours so the homepage is never empty
    if (featured === 'true') {
        const featuredFilter = { ...filter, featured: true };
        const featuredCount = await Tour.countDocuments(featuredFilter);

        if (featuredCount > 0) {
            const tours = await Tour.find(featuredFilter)
                .sort(sort as string)
                .skip(skip)
                .limit(limitNum);
            const total = await Tour.countDocuments(featuredFilter);
            res.json({
                data: tours,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            });
            return;
        }

        // Fallback: return top-rated / most recent tours
        const tours = await Tour.find(filter)
            .sort('-averageRating -totalRatings -createdAt')
            .skip(skip)
            .limit(limitNum);
        const total = await Tour.countDocuments(filter);
        res.json({
            data: tours,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        });
        return;
    }

    // Normal query
    const [tours, total] = await Promise.all([
        Tour.find(filter).sort(sort as string).skip(skip).limit(limitNum),
        Tour.countDocuments(filter),
    ]);

    res.json({
        data: tours,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
    });
});

// @desc Get tour by ID
// @route GET /api/tours/:id
export const getTourById = asyncHandler(async (req: Request, res: Response) => {
    const tour = await Tour.findById(req.params.id);
    if (tour) {
        res.json(tour);
    } else {
        res.status(404);
        throw new Error('Tour not found');
    }
});

// @desc Create a tour
// @route POST /api/tours
// @access Private/Admin
export const createTour = asyncHandler(async (req: Request, res: Response) => {
    const tour = new Tour(req.body);
    const createdTour = await tour.save();
    res.status(201).json(createdTour);
});

// @desc Update a tour
// @route PUT /api/tours/:id
// @access Private/Admin
export const updateTour = asyncHandler(async (req: Request, res: Response) => {
    const tour = await Tour.findById(req.params.id);
    if (tour) {
        Object.assign(tour, req.body);
        const updatedTour = await tour.save();
        res.json(updatedTour);
    } else {
        res.status(404);
        throw new Error('Tour not found');
    }
});

// @desc Delete a tour
// @route DELETE /api/tours/:id
// @access Private/Admin
export const deleteTour = asyncHandler(async (req: Request, res: Response) => {
    const tour = await Tour.findById(req.params.id);
    if (tour) {
        await tour.deleteOne();
        res.json({ message: 'Tour removed' });
    } else {
        res.status(404);
        throw new Error('Tour not found');
    }
});
