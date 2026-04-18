import mongoose from 'mongoose';
import { addDays, setHours } from 'date-fns';
import PackageDeparture from '../../modules/packages/models/packageDepartureModel';

export interface DepartureSeedRow {
    packageCode: string;
    sku: string;
    daysFromNow: number;
    hourUTC: number;
    capacity: number;
    bookedCount: number;
    status: 'scheduled' | 'open' | 'full' | 'cancelled';
    notes?: string;
}

/** Multiple future departures per package — open, limited, sold-out, cancelled */
export const DEPARTURE_BLUEPRINT: DepartureSeedRow[] = [
    // North historical
    { packageCode: 'ETH-NORTH-12D', sku: 'ETH-NORTH-2026-A', daysFromNow: 24, hourUTC: 6, capacity: 16, bookedCount: 6, status: 'open', notes: 'Spring dry season departure' },
    { packageCode: 'ETH-NORTH-12D', sku: 'ETH-NORTH-2026-B', daysFromNow: 58, hourUTC: 6, capacity: 14, bookedCount: 12, status: 'open', notes: 'Limited seats remaining' },
    { packageCode: 'ETH-NORTH-12D', sku: 'ETH-NORTH-2026-C', daysFromNow: 92, hourUTC: 6, capacity: 12, bookedCount: 12, status: 'full', notes: 'Waitlist only' },
    // Simien trek
    { packageCode: 'ETH-SIMIEN-10D', sku: 'ETH-SIMIEN-2026-A', daysFromNow: 31, hourUTC: 5, capacity: 12, bookedCount: 8, status: 'open' },
    { packageCode: 'ETH-SIMIEN-10D', sku: 'ETH-SIMIEN-2026-B', daysFromNow: 72, hourUTC: 5, capacity: 12, bookedCount: 12, status: 'full' },
    { packageCode: 'ETH-SIMIEN-10D', sku: 'ETH-SIMIEN-2026-C', daysFromNow: 110, hourUTC: 5, capacity: 10, bookedCount: 4, status: 'open' },
    // Omo cultural
    { packageCode: 'ETH-OMO-11D', sku: 'ETH-OMO-2026-A', daysFromNow: 40, hourUTC: 7, capacity: 10, bookedCount: 3, status: 'open' },
    { packageCode: 'ETH-OMO-11D', sku: 'ETH-OMO-2026-B', daysFromNow: 85, hourUTC: 7, capacity: 10, bookedCount: 9, status: 'open', notes: 'Market week alignment' },
    { packageCode: 'ETH-OMO-11D', sku: 'ETH-OMO-2026-C', daysFromNow: 130, hourUTC: 7, capacity: 8, bookedCount: 0, status: 'scheduled' },
    // Bale wildlife
    { packageCode: 'ETH-BALE-9D', sku: 'ETH-BALE-2026-A', daysFromNow: 19, hourUTC: 4, capacity: 8, bookedCount: 5, status: 'open' },
    { packageCode: 'ETH-BALE-9D', sku: 'ETH-BALE-2026-B', daysFromNow: 55, hourUTC: 4, capacity: 8, bookedCount: 8, status: 'full' },
    { packageCode: 'ETH-BALE-9D', sku: 'ETH-BALE-2026-C', daysFromNow: 98, hourUTC: 4, capacity: 8, bookedCount: 2, status: 'open' },
    // Luxury
    { packageCode: 'ETH-LUX-14D', sku: 'ETH-LUX-2026-A', daysFromNow: 45, hourUTC: 10, capacity: 6, bookedCount: 4, status: 'open' },
    { packageCode: 'ETH-LUX-14D', sku: 'ETH-LUX-2026-B', daysFromNow: 120, hourUTC: 10, capacity: 6, bookedCount: 6, status: 'full' },
    { packageCode: 'ETH-LUX-14D', sku: 'ETH-LUX-2026-C', daysFromNow: 200, hourUTC: 10, capacity: 6, bookedCount: 2, status: 'open' },
    // Danakil
    { packageCode: 'ETH-DANAKIL-6D', sku: 'ETH-DANAKIL-2026-A', daysFromNow: 27, hourUTC: 3, capacity: 12, bookedCount: 10, status: 'open', notes: 'Heat briefing mandatory' },
    { packageCode: 'ETH-DANAKIL-6D', sku: 'ETH-DANAKIL-2026-B', daysFromNow: 63, hourUTC: 3, capacity: 12, bookedCount: 12, status: 'full' },
    {
        packageCode: 'ETH-DANAKIL-6D',
        sku: 'ETH-DANAKIL-2026-C',
        daysFromNow: 150,
        hourUTC: 3,
        capacity: 12,
        bookedCount: 0,
        status: 'cancelled',
        notes: 'Cancelled — regional escort logistics; deposits refunded',
    },
];

export async function seedDepartures(byPackageCode: Map<string, mongoose.Types.ObjectId>) {
    const docs: any[] = [];

    for (const row of DEPARTURE_BLUEPRINT) {
        const packageId = byPackageCode.get(row.packageCode);
        if (!packageId) throw new Error(`Missing tour for packageCode ${row.packageCode}`);

        const startsAt = setHours(addDays(new Date(), row.daysFromNow), row.hourUTC);
        const endsAt = addDays(startsAt, 1);

        docs.push({
            packageId,
            startsAt,
            endsAt,
            capacity: row.capacity,
            bookedCount: row.bookedCount,
            status: row.status,
            sku: row.sku,
            notes: row.notes,
        });
    }

    const inserted = await PackageDeparture.insertMany(docs);

    const bySku = new Map<string, mongoose.Types.ObjectId>();
    for (const d of inserted) {
        const doc = d as any;
        if (doc.sku) bySku.set(doc.sku, doc._id);
    }

    return { departures: inserted, bySku };
}
