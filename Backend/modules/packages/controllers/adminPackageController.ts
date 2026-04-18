import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Tour from '../../../models/tourModel';
import { normalizePackagePayload } from '../compat/packageDto';
import type { PackageSectionKey } from '../validators/packageSchemas';
import { packageSectionSchemas } from '../validators/packageSchemas';

/** GET /api/admin/packages — full documents for builder (includes drafts) */
export const getAdminPackages = asyncHandler(async (req: Request, res: Response) => {
    const { status, limit = '100', page = '1' } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const limitNum = Math.min(Number(limit), 200);
    const pageNum = Math.max(Number(page), 1);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
        Tour.find(filter).sort('-updatedAt').skip(skip).limit(limitNum).lean(),
        Tour.countDocuments(filter),
    ]);

    res.json({
        data,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
    });
});

export const getAdminPackageById = asyncHandler(async (req: Request, res: Response) => {
    const tour = await Tour.findById(req.params.id).lean();
    if (!tour) {
        res.status(404);
        throw new Error('Package not found');
    }
    res.json(tour);
});

export const createAdminPackage = asyncHandler(async (req: Request, res: Response) => {
    const payload = normalizePackagePayload(req.body as any);
    const tour = await Tour.create(payload);
    res.status(201).json(tour);
});

export const updateAdminPackage = asyncHandler(async (req: Request, res: Response) => {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
        res.status(404);
        throw new Error('Package not found');
    }
    Object.assign(tour, normalizePackagePayload(req.body as any));
    const saved = await tour.save();
    res.json(saved);
});

export const deleteAdminPackage = asyncHandler(async (req: Request, res: Response) => {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
        res.status(404);
        throw new Error('Package not found');
    }
    await tour.deleteOne();
    res.json({ message: 'Package removed' });
});

/** PATCH /api/admin/packages/:id/:section — validated partial updates for Package Builder tabs */
export const patchAdminPackageSection = asyncHandler(async (req: Request, res: Response) => {
    const section = req.params.section as PackageSectionKey;
    const schema = packageSectionSchemas[section];
    if (!schema) {
        res.status(400);
        throw new Error(`Unknown section: ${section}`);
    }

    const parsed = schema.parse(req.body);
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
        res.status(404);
        throw new Error('Package not found');
    }

    Object.assign(tour, parsed);
    const saved = await tour.save();
    res.json(saved);
});
