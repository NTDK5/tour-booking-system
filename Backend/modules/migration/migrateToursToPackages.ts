/**
 * One-off migration: normalize legacy flat tour docs into TourPackage shape.
 * Run: npx ts-node modules/migration/migrateToursToPackages.ts (from Backend/)
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../../config/db';
import { ENTERPRISE_SCHEMA_VERSION } from '../packages/compat/legacyTourMapper';

function parseDaysFromUnknown(duration: unknown, durationLegacy?: unknown): { days: number; nights: number } {
    let days = 1;
    if (duration && typeof duration === 'object' && 'days' in (duration as any)) {
        const n = Number((duration as any).days);
        if (!Number.isNaN(n)) days = Math.max(1, n);
        const nights = Number((duration as any).nights);
        return { days, nights: !Number.isNaN(nights) ? nights : Math.max(0, days - 1) };
    }
    if (typeof duration === 'string') {
        const n = parseInt(duration.replace(/\D/g, ''), 10);
        if (!Number.isNaN(n)) days = Math.max(1, n);
    }
    if (durationLegacy != null) {
        const n = parseInt(String(durationLegacy).replace(/\D/g, ''), 10);
        if (!Number.isNaN(n)) days = Math.max(1, n);
    }
    return { days, nights: Math.max(0, days - 1) };
}

function slugify(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 96);
}

async function migrate() {
    await connectDB();
    const coll = mongoose.connection.collection('tours');
    const total = await coll.countDocuments();
    console.log(`Scanning ${total} documents in tours...`);

    let updated = 0;
    const cursor = coll.find({});

    for await (const doc of cursor) {
        const d = doc as any;
        const { days, nights } = parseDaysFromUnknown(d.duration, d.durationLegacy);

        const dest =
            typeof d.destination === 'string' && d.destination.trim()
                ? d.destination.trim()
                : typeof d.legacyDestination === 'string'
                  ? d.legacyDestination.trim()
                  : '';

        const priceNum = Number(d.basePrice ?? d.price ?? d.legacyPrice ?? 0) || 0;

        const set: Record<string, unknown> = {
            schemaVersion: ENTERPRISE_SCHEMA_VERSION,
            duration: { days, nights },
            itinerary: Array.isArray(d.itinerary) ? d.itinerary : [],
        };

        if (dest) {
            set.destinations = Array.isArray(d.destinations) && d.destinations.length ? d.destinations : [dest];
            if (!d.destination) set.destination = dest;
        }

        if (priceNum > 0) {
            if (d.basePrice == null || d.basePrice === 0) set.basePrice = priceNum;
            if (d.price == null || d.price === 0) set.price = priceNum;
        }

        if (d.legacyPrice == null && d.price != null) set.legacyPrice = d.price;
        if (d.legacyDestination == null && d.destination != null) set.legacyDestination = d.destination;

        if (!d.slug && typeof d.title === 'string' && d.title.trim()) {
            set.slug = slugify(d.title);
        }

        if (!d.fullDescription && typeof d.description === 'string') {
            set.fullDescription = d.description;
        }
        if (!d.shortDescription && typeof d.description === 'string') {
            set.shortDescription = String(d.description).slice(0, 280);
        }

        const needsUpdate =
            d.schemaVersion !== ENTERPRISE_SCHEMA_VERSION ||
            typeof d.duration === 'string' ||
            (d.duration && typeof d.duration === 'object' && d.duration.days == null);

        if (needsUpdate || Object.keys(set).length > 3) {
            await coll.updateOne({ _id: d._id }, { $set: set });
            updated++;
        }
    }

    console.log(`Done. Updated ${updated} documents.`);
    await mongoose.disconnect();
    process.exit(0);
}

migrate().catch((e) => {
    console.error(e);
    process.exit(1);
});
