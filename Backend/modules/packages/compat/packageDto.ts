/** Map stored tour/package document to stable customer API shape */

/** Normalize incoming API/admin payloads (legacy flat + enterprise nested). */
export function normalizePackagePayload(body: Record<string, any>): Record<string, any> {
    const b = { ...body };
    if (typeof b.duration === 'number') {
        const days = Math.max(1, b.duration);
        b.duration = { days, nights: Math.max(0, days - 1) };
    }
    if (b.groupSize != null && b.maxGuests == null) {
        b.maxGuests = Number(b.groupSize);
    }
    if (b.description && !b.fullDescription) {
        b.fullDescription = b.description;
    }
    if (b.destination && (!b.destinations || !b.destinations.length)) {
        b.destinations = [String(b.destination)];
    }
    if ((b.basePrice == null || b.basePrice === 0) && b.price != null) {
        b.basePrice = Number(b.price);
    }
    return b;
}

export function parseDurationDays(pkg: any): number {
    if (pkg?.duration?.days != null && !Number.isNaN(Number(pkg.duration.days))) {
        return Number(pkg.duration.days);
    }
    if (typeof pkg?.duration === 'string') {
        const n = parseInt(String(pkg.duration).replace(/\D/g, ''), 10);
        if (!Number.isNaN(n)) return n;
    }
    if (pkg?.durationLegacy != null) {
        const n = parseInt(String(pkg.durationLegacy).replace(/\D/g, ''), 10);
        if (!Number.isNaN(n)) return n;
    }
    return 1;
}

export function mapTourToPublicDto(pkg: any): Record<string, any> {
    const o = pkg?.toObject ? pkg.toObject() : { ...pkg };
    const galleries = [o.gallery, o.images, o.imageUrl].find((g: any) => Array.isArray(g) && g.length) || [];
    const cover = o.coverImage || galleries[0] || (Array.isArray(o.imageUrl) ? o.imageUrl[0] : undefined);

    const destinations =
        Array.isArray(o.destinations) && o.destinations.length
            ? o.destinations
            : o.destination
              ? [o.destination]
              : o.legacyDestination
                ? [o.legacyDestination]
                : [];

    const startingPrice =
        o.basePrice > 0 ? o.basePrice : o.price > 0 ? o.price : o.legacyPrice ?? 0;

    return {
        ...o,
        _id: o._id,
        price: startingPrice,
        images: galleries,
        imageUrl: o.imageUrl || galleries,
        destination: destinations[0] || o.destination,
        destinations,
        duration: parseDurationDays(o),
        durationDetail: o.duration && typeof o.duration === 'object' ? o.duration : { days: parseDurationDays(o), nights: o.duration?.nights ?? 0 },
        startingPrice,
        included: o.included || [],
        excluded: o.excluded || [],
        highlights: o.highlights || [],
        fullDescription: o.fullDescription || o.description,
        shortDescription: o.shortDescription || (o.description ? String(o.description).slice(0, 200) : ''),
        tourType: o.tourType || 'cultural',
        status: o.status || 'published',
        difficulty: o.difficulty || 'medium',
        groupSize: o.maxGuests ?? 10,
        rating: o.averageRating ?? 0,
        reviewCount: o.totalRatings ?? 0,
        coverImage: cover,
    };
}
