import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Tour from '../models/tourModel';
import { mapTourToPublicDto, normalizePackagePayload } from '../modules/packages/compat/packageDto';
import { buildTourListFilter, listToursPaginated } from '../modules/packages/services/packageQueryService';

// @desc Get all tours / packages (optional filters)
// @route GET /api/tours
export const getTours = asyncHandler(async (req: Request, res: Response) => {
    const {
        featured,
        limit = 20,
        page = 1,
        sort = '-averageRating',
    } = req.query;

    const limitNum = Math.min(Number(limit), 100);
    const pageNum = Math.max(Number(page), 1);
    const skip = (pageNum - 1) * limitNum;

    const filter = buildTourListFilter(req.query as any, { publicCatalog: true });

    if (featured === 'true') {
        const featuredFilter = { ...filter, featured: true };
        const featuredCount = await Tour.countDocuments(featuredFilter);

        if (featuredCount > 0) {
            const { data, total } = await listToursPaginated({
                filter: featuredFilter,
                sort: sort as string,
                skip,
                limit: limitNum,
            });
            res.json({
                data: data.map(mapTourToPublicDto),
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            });
            return;
        }

        const { data, total } = await listToursPaginated({
            filter,
            sort: '-averageRating -totalRatings -createdAt',
            skip,
            limit: limitNum,
        });
        res.json({
            data: data.map(mapTourToPublicDto),
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        });
        return;
    }

    const { data, total } = await listToursPaginated({
        filter,
        sort: sort as string,
        skip,
        limit: limitNum,
    });

    res.json({
        data: data.map(mapTourToPublicDto),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
    });
});

// @desc Get tour / package by ID (public DTO)
// @route GET /api/tours/:id
export const getTourById = asyncHandler(async (req: Request, res: Response) => {
    const tour = await Tour.findById(req.params.id);
    if (tour) {
        res.json(mapTourToPublicDto(tour));
    } else {
        res.status(404);
        throw new Error('Tour not found');
    }
});

// @desc Create a tour / package
// @route POST /api/tours
// @access Private/Admin
export const createTour = asyncHandler(async (req: Request, res: Response) => {
    const tour = new Tour(normalizePackagePayload(req.body as any));
    const createdTour = await tour.save();
    res.status(201).json(mapTourToPublicDto(createdTour));
});

// @desc Update a tour / package
// @route PUT /api/tours/:id
// @access Private/Admin
export const updateTour = asyncHandler(async (req: Request, res: Response) => {
    const tour = await Tour.findById(req.params.id);
    if (tour) {
        Object.assign(tour, normalizePackagePayload(req.body as any));
        const updatedTour = await tour.save();
        res.json(mapTourToPublicDto(updatedTour));
    } else {
        res.status(404);
        throw new Error('Tour not found');
    }
});

// @desc Delete a tour / package
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
