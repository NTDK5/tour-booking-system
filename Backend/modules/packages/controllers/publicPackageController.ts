import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Tour from '../../../models/tourModel';
import { mapTourToPublicDto } from '../compat/packageDto';
import { calculatePackageQuote } from '../services/pricingService';
import { checkPackageAvailability } from '../services/availabilityService';
import { buildTourListFilter, listToursPaginated } from '../services/packageQueryService';

/** GET /api/packages — same behaviour as GET /api/tours with public DTO */
export const getPackages = asyncHandler(async (req: Request, res: Response) => {
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

export const getPackageById = asyncHandler(async (req: Request, res: Response) => {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
        res.status(404);
        throw new Error('Package not found');
    }
    res.json(mapTourToPublicDto(tour));
});

export const postPackageQuote = asyncHandler(async (req: Request, res: Response) => {
    const pkg = await Tour.findById(req.params.id);
    if (!pkg) {
        res.status(404);
        throw new Error('Package not found');
    }
    const { guests = 1, children = 0, travelDate, selectedAddons } = req.body;
    const quote = calculatePackageQuote(pkg, {
        guests: Number(guests),
        children: Number(children),
        travelDate: travelDate ? new Date(travelDate) : undefined,
        selectedAddonNames: Array.isArray(selectedAddons) ? selectedAddons : [],
    });
    res.json({
        packageId: req.params.id,
        ...quote,
        quotedAt: new Date().toISOString(),
    });
});

export const getPackageAvailability = asyncHandler(async (req: Request, res: Response) => {
    const pkg = await Tour.findById(req.params.id);
    if (!pkg) {
        res.status(404);
        throw new Error('Package not found');
    }
    const { departureId, guests = 1, bookingDate } = req.query;
    const result = await checkPackageAvailability(pkg, {
        packageId: String(req.params.id),
        departureId: departureId ? String(departureId) : undefined,
        guests: Number(guests),
        bookingDate: bookingDate ? new Date(String(bookingDate)) : undefined,
    });
    res.json(result);
});
