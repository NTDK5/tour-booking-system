import mongoose from 'mongoose';
import Booking from '../../models/bookingModel';
import Tour from '../../models/tourModel';
import { calculatePackageQuote } from '../../modules/packages/services/pricingService';

type CustomerUser = { _id: mongoose.Types.ObjectId; email?: string };

interface SeedBookingDef {
    label: string;
    userIndex: number;
    packageCode: string;
    departureSku?: string;
    guests: number;
    children?: number;
    addonNames?: string[];
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    paymentMethod: 'credit card' | 'card' | 'paypal' | 'bank transfer' | 'cash';
    notes?: string;
    /** Negative offset days for createdAt (dashboard trends) */
    createdDaysAgo?: number;
}

const BOOKING_DEFS: SeedBookingDef[] = [
    {
        label: 'North circuit — awaiting deposit',
        userIndex: 0,
        packageCode: 'ETH-NORTH-12D',
        departureSku: 'ETH-NORTH-2026-A',
        guests: 2,
        addonNames: ['Private airport VIP meet in Addis', 'Professional photography mentoring day'],
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'paypal',
        notes: 'Guest prefers aisle seats on domestic legs; lacto-ovo vegetarian meals.',
        createdDaysAgo: 2,
    },
    {
        label: 'Simien trek — confirmed & paid',
        userIndex: 1,
        packageCode: 'ETH-SIMIEN-10D',
        departureSku: 'ETH-SIMIEN-2026-A',
        guests: 4,
        addonNames: ['Portable oxygen cylinder standby'],
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'credit card',
        notes: 'Altitude medication declaration on file.',
        createdDaysAgo: 9,
    },
    {
        label: 'Danakil expedition — cancelled',
        userIndex: 2,
        packageCode: 'ETH-DANAKIL-6D',
        departureSku: 'ETH-DANAKIL-2026-A',
        guests: 6,
        addonNames: ['Personal cooling vest rental'],
        status: 'cancelled',
        paymentStatus: 'partial',
        paymentMethod: 'bank transfer',
        notes: 'Guest mobility concern post-booking — cancellation fee waived per policy clause 4c.',
        createdDaysAgo: 14,
    },
    {
        label: 'Omo cultural — payment window',
        userIndex: 3,
        packageCode: 'ETH-OMO-11D',
        departureSku: 'ETH-OMO-2026-A',
        guests: 3,
        children: 1,
        addonNames: ['Premium tent suite upgrade'],
        status: 'pending',
        paymentStatus: 'partial',
        paymentMethod: 'paypal',
        notes: 'Community photography consent forms signed digitally.',
        createdDaysAgo: 5,
    },
    {
        label: 'Bale safari — confirmed corporate incentive',
        userIndex: 4,
        packageCode: 'ETH-BALE-9D',
        departureSku: 'ETH-BALE-2026-A',
        guests: 2,
        addonNames: ['Night photography rig rental (gimbal + lens)'],
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'credit card',
        notes: 'Corporate VAT receipt required — invoiced to Nomadlabs India Pvt Ltd.',
        createdDaysAgo: 21,
    },
    {
        label: 'Luxury highlights — concierge hold',
        userIndex: 5,
        packageCode: 'ETH-LUX-14D',
        departureSku: 'ETH-LUX-2026-A',
        guests: 2,
        addonNames: ['Private sommelier cellar raid'],
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'credit card',
        notes: 'Champagne dietary pairing — chef notified.',
        createdDaysAgo: 7,
    },
    {
        label: 'North circuit — repeat guest upgrade path',
        userIndex: 1,
        packageCode: 'ETH-NORTH-12D',
        departureSku: 'ETH-NORTH-2026-B',
        guests: 5,
        addonNames: ['Domestic flight upgrade to Cloud Nine flex fares'],
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'paypal',
        createdDaysAgo: 1,
    },
    {
        label: 'Simien trek — outfitter coordination',
        userIndex: 0,
        packageCode: 'ETH-SIMIEN-10D',
        departureSku: 'ETH-SIMIEN-2026-C',
        guests: 6,
        addonNames: [],
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'bank transfer',
        notes: 'NGO cohort — CSR invoice routing.',
        createdDaysAgo: 18,
    },
];

export async function seedBookings(params: {
    customers: CustomerUser[];
    byPackageCode: Map<string, mongoose.Types.ObjectId>;
    departureBySku: Map<string, mongoose.Types.ObjectId>;
}) {
    const created: mongoose.Types.ObjectId[] = [];

    for (const def of BOOKING_DEFS) {
        const user = params.customers[def.userIndex];
        const tourId = params.byPackageCode.get(def.packageCode);
        if (!user || !tourId) throw new Error(`seedBookings missing user or tour for ${def.label}`);

        const tourDoc = await Tour.findById(tourId);
        if (!tourDoc) throw new Error(`Tour not found ${def.packageCode}`);

        const travelDate = new Date();
        travelDate.setDate(travelDate.getDate() + 45);

        const quote = calculatePackageQuote(tourDoc, {
            guests: def.guests,
            children: def.children ?? 0,
            travelDate,
            selectedAddonNames: def.addonNames ?? [],
        });

        const persistedAddons =
            def.addonNames?.map((name) => {
                const addon = (tourDoc as any).addons?.find((a: any) => a?.name === name);
                return { name, price: Number(addon?.price ?? 0) };
            }) ?? [];

        const departureId = def.departureSku ? params.departureBySku.get(def.departureSku) : undefined;

        const bookingDate = new Date();
        if (def.createdDaysAgo != null) {
            bookingDate.setDate(bookingDate.getDate() - def.createdDaysAgo);
        }

        const history = [
            {
                status: def.status,
                timestamp: bookingDate,
                comment:
                    def.status === 'cancelled'
                        ? 'Reservation cancelled — seed narrative for QA dashboards'
                        : 'Reservation synchronized from Dorze enterprise seed suite',
            },
        ];

        const doc: any = {
            user: user._id,
            bookingType: 'Tour',
            tour: tourId,
            numberOfPeople: def.guests,
            totalPrice: quote.total,
            depositAmount: quote.deposit,
            paymentMethod: def.paymentMethod,
            notes: def.notes,
            internalNotes: 'dorze-seed-batch',
            status: def.status,
            paymentStatus: def.paymentStatus,
            source: 'online',
            bookingDate,
            startDate: bookingDate,
            endDate: bookingDate,
            packagePricingSnapshot: {
                currency: quote.currency,
                lines: quote.lines,
                subtotal: quote.subtotal,
                discounts: quote.discounts,
                deposit: quote.deposit,
                total: quote.total,
                pricingType: quote.pricingType,
                quotedAt: new Date(),
                guests: def.guests,
                children: def.children ?? 0,
            },
            selectedAddons: persistedAddons.length ? persistedAddons : undefined,
            departureId,
            history,
        };

        const booking = await Booking.create(doc);
        created.push(booking._id as mongoose.Types.ObjectId);

        if (def.createdDaysAgo != null) {
            await Booking.collection.updateOne(
                { _id: booking._id as mongoose.Types.ObjectId },
                { $set: { createdAt: bookingDate, updatedAt: new Date() } }
            );
        }
    }

    return { bookingIds: created };
}
