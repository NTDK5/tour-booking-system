/**
 * One-off migration: backfill enterprise booking fields + payment ledger from legacy Payment docs;
 * normalize PackageDeparture capacity counters from legacy bookedCount.
 *
 * Run from Backend/: npx ts-node modules/migration/migrateBookingsToEnterprise.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../../config/db';
import Booking from '../../models/bookingModel';
import Payment from '../../models/paymentModel';
import PackageDeparture from '../packages/models/packageDepartureModel';
import { generateBookingNumber } from '../bookings/services/bookingNumberService';
import { appendLedgerEntry, syncBookingPaymentFields } from '../bookings/payments/bookingPaymentService';
import type { BookingLifecycleStatus } from '../bookings/models/bookingSchema';

function mapLifecycle(status?: string): BookingLifecycleStatus {
    const s = String(status || 'pending').toLowerCase();
    if (['cancelled', 'expired', 'refunded', 'rejected'].includes(s)) return 'cancelled';
    if (['confirmed', 'accepted'].includes(s)) return 'confirmed';
    return 'pending';
}

function mapInventoryPhase(b: {
    departureId?: mongoose.Types.ObjectId;
    lifecycleStatus?: BookingLifecycleStatus;
}): 'none' | 'reserved' | 'confirmed' | 'released' {
    if (!b.departureId) return 'none';
    if (b.lifecycleStatus === 'cancelled') return 'released';
    if (b.lifecycleStatus === 'confirmed') return 'confirmed';
    return 'reserved';
}

async function migrate() {
    await connectDB();

    const bookings = await Booking.find({}).sort({ createdAt: 1 });
    console.log(`Migrating ${bookings.length} bookings...`);

    for (const b of bookings) {
        const createdYear = new Date((b as any).createdAt || Date.now()).getFullYear();

        if (!b.bookingNumber) {
            b.bookingNumber = await generateBookingNumber(createdYear);
        }

        if (!b.lifecycleStatus) {
            b.lifecycleStatus = mapLifecycle(String(b.status));
        }

        if (!b.inventoryPhase || b.inventoryPhase === 'none') {
            b.inventoryPhase = mapInventoryPhase(b);
        }

        if (!b.schemaVersion) {
            b.schemaVersion = 2;
        }

        const snap = b.packagePricingSnapshot as Record<string, unknown> | undefined;
        if (!b.pricingSnapshot && snap && typeof snap === 'object') {
            const subtotal = Number(snap.subtotal ?? b.totalPrice ?? 0);
            const total = Number(snap.total ?? b.totalPrice ?? subtotal);
            const deposit = Number(snap.deposit ?? b.depositAmount ?? 0);
            const lines = Array.isArray(snap.lines) ? (snap.lines as { label: string; amount: number }[]) : [];
            let addOnsTotal = 0;
            for (const line of lines) {
                if (line.label?.startsWith?.('Add-on')) addOnsTotal += Number(line.amount) || 0;
            }
            const baseAmount = Math.max(0, subtotal - addOnsTotal);

            b.pricingSnapshot = {
                baseAmount,
                groupDiscountAmount: 0,
                seasonalAdjustmentAmount: 0,
                addOnsTotal,
                subtotal,
                depositAmount: deposit,
                totalAmount: total,
                currency: String(snap.currency || 'USD'),
                lines,
                quotedAt: snap.quotedAt ? new Date(String(snap.quotedAt)) : new Date(),
                guests: Number(snap.guests ?? b.numberOfPeople),
                children: Number(snap.children ?? 0),
                pricingType: String(snap.pricingType || ''),
            };
        }

        const payments = await Payment.find({ booking: b._id }).sort({ createdAt: 1 });
        if ((!b.paymentLedger || b.paymentLedger.length === 0) && payments.length > 0) {
            const depositDue = b.pricingSnapshot?.depositAmount ?? b.depositAmount ?? 0;
            payments.forEach((p, idx) => {
                const amt = Number(p.amount);
                let paymentType: 'deposit' | 'balance' = 'balance';
                if (
                    depositDue > 0 &&
                    idx === 0 &&
                    amt <= depositDue + 0.02
                ) {
                    paymentType = 'deposit';
                }

                appendLedgerEntry(b, {
                    paymentType,
                    amount: amt,
                    currency: p.currency || 'USD',
                    method: p.provider === 'stripe' ? 'stripe' : 'paypal',
                    status:
                        p.status === 'completed'
                            ? 'completed'
                            : p.status === 'failed'
                              ? 'failed'
                              : 'pending',
                    transactionReference: p.txRef,
                    provider: p.provider,
                    paidAt: p.status === 'completed' ? new Date() : undefined,
                    stripePaymentIntentId: p.stripePaymentIntentId,
                });
            });
            syncBookingPaymentFields(b);
            const lastCompleted = [...payments].reverse().find((x) => x.status === 'completed');
            if (lastCompleted?._id) {
                b.paymentId = lastCompleted._id as any;
            }
        }

        await b.save();
    }

    const deps = await PackageDeparture.find({});
    console.log(`Updating ${deps.length} departures (bookedCount → confirmedGuests)...`);

    for (const d of deps) {
        const booked = d.bookedCount ?? 0;
        if ((d.confirmedGuests ?? 0) === 0 && booked > 0) {
            d.confirmedGuests = booked;
        }
        if ((d.reservedGuests ?? 0) === 0 && booked === 0) {
            /* noop */
        }
        await d.save();
    }

    console.log('migrateBookingsToEnterprise complete.');
    await mongoose.disconnect();
}

migrate().catch((e) => {
    console.error(e);
    process.exit(1);
});
