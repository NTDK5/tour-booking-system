import mongoose from 'mongoose';
import Tour from '../../models/tourModel';
import { PREMIUM_PACKAGES } from '../data/definitions';

export async function seedPackages() {
    const inserted = await Tour.insertMany(PREMIUM_PACKAGES as any[]);

    const byPackageCode = new Map<string, mongoose.Types.ObjectId>();
    const bySlug = new Map<string, mongoose.Types.ObjectId>();

    for (const t of inserted) {
        const doc = t as any;
        if (doc.packageCode) byPackageCode.set(doc.packageCode, doc._id);
        if (doc.slug) bySlug.set(doc.slug, doc._id);
    }

    return { tours: inserted, byPackageCode, bySlug };
}
