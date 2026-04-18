import Tour from '../../../models/tourModel';

/**
 * Shared filter builder for tour/package listing (legacy + enterprise fields).
 * @param publicCatalog — when true, exclude draft/archived packages from customer-facing lists.
 */
export function buildTourListFilter(
    reqQuery: Record<string, any>,
    options?: { publicCatalog?: boolean }
): Record<string, any> {
    const {
        category,
        destination,
        days,
        duration,
        difficulty,
        minPrice,
        maxPrice,
        search,
        status,
    } = reqQuery;

    const filter: Record<string, any> = {};
    const andParts: any[] = [];

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;

    if (destination) {
        const rx = { $regex: destination, $options: 'i' };
        andParts.push({
            $or: [{ destination: rx }, { destinations: rx }, { legacyDestination: rx }],
        });
    }

    const dayNum = days || duration;
    if (dayNum) {
        const d = Number(dayNum);
        andParts.push({
            $or: [
                { 'duration.days': d },
                { duration: new RegExp(`^${d}\\b`) },
                { duration: String(d) },
            ],
        });
    }

    if (minPrice || maxPrice) {
        const priceCond: any = {};
        if (minPrice) priceCond.$gte = Number(minPrice);
        if (maxPrice) priceCond.$lte = Number(maxPrice);
        andParts.push({
            $or: [{ basePrice: priceCond }, { price: priceCond }],
        });
    }

    if (search) {
        const s = String(search);
        andParts.push({
            $or: [
                { title: { $regex: s, $options: 'i' } },
                { destination: { $regex: s, $options: 'i' } },
                { description: { $regex: s, $options: 'i' } },
                { fullDescription: { $regex: s, $options: 'i' } },
            ],
        });
    }

    if (options?.publicCatalog && !status) {
        andParts.push({
            $or: [{ status: 'published' }, { status: { $exists: false } }],
        });
    }

    if (andParts.length) filter.$and = andParts;

    return filter;
}

export async function listToursPaginated(params: {
    filter: Record<string, any>;
    sort?: string;
    skip: number;
    limit: number;
}) {
    const sort = params.sort || '-averageRating';
    const [data, total] = await Promise.all([
        Tour.find(params.filter).sort(sort).skip(params.skip).limit(params.limit),
        Tour.countDocuments(params.filter),
    ]);
    return { data, total };
}
