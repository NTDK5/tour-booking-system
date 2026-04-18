import mongoose from 'mongoose';
import Payment from '../../../models/paymentModel';
import type { IBooking } from '../models/bookingSchema';
import { confirmDepartureSeats } from '../services/bookingInventoryService';

export interface LedgerAppendInput {
    paymentType: 'deposit' | 'balance' | 'refund' | 'adjustment';
    amount: number;
    currency?: string;
    method: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    transactionReference?: string;
    provider?: 'paypal' | 'stripe' | 'manual' | 'cash' | 'bank_transfer';
    paidAt?: Date;
    stripePaymentIntentId?: string;
    notes?: string;
}

export function derivePaymentTotals(booking: IBooking): {
    totalPaid: number;
    balanceDue: number;
    paymentStatus: 'unpaid' | 'partial' | 'paid';
} {
    const total = booking.pricingSnapshot?.totalAmount ?? booking.totalPrice ?? 0;
    let paid = 0;
    for (const e of booking.paymentLedger || []) {
        if (e.status !== 'completed') continue;
        if (e.paymentType === 'refund') paid -= Math.abs(e.amount);
        else paid += e.amount;
    }
    paid = Math.round(paid * 100) / 100;
    const balanceDue = Math.max(0, Math.round((total - paid) * 100) / 100);

    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
    if (balanceDue <= 0.01) paymentStatus = 'paid';
    else if (paid > 0) paymentStatus = 'partial';

    return { totalPaid: paid, balanceDue, paymentStatus };
}

export function syncBookingPaymentFields(booking: IBooking): void {
    const { paymentStatus } = derivePaymentTotals(booking);
    booking.paymentStatus = paymentStatus;
}

/** Append ledger entry and refresh paymentStatus */
export function appendLedgerEntry(booking: IBooking, entry: LedgerAppendInput): void {
    if (!booking.paymentLedger) booking.paymentLedger = [];
    booking.paymentLedger.push({
        paymentType: entry.paymentType,
        amount: entry.amount,
        currency: entry.currency || 'USD',
        method: entry.method,
        status: entry.status,
        transactionReference: entry.transactionReference,
        provider: entry.provider,
        paidAt: entry.paidAt,
        stripePaymentIntentId: entry.stripePaymentIntentId,
        notes: entry.notes,
    });
    syncBookingPaymentFields(booking);
}

/**
 * Record a successful gateway capture on the booking ledger and align lifecycle/inventory.
 * Idempotent when the same `transactionReference` already exists as completed on the ledger.
 */
export async function applyGatewayPaymentSuccess(
    booking: IBooking,
    params: {
        amount: number;
        currency?: string;
        provider: 'paypal' | 'stripe';
        txRef: string;
        stripePaymentIntentId?: string;
        transactionId?: string;
        legacyPaymentId?: mongoose.Types.ObjectId;
    }
): Promise<void> {
    const dup = booking.paymentLedger?.some(
        (e) => e.transactionReference === params.txRef && e.status === 'completed'
    );
    if (dup) return;

    const depositDue =
        booking.pricingSnapshot?.depositAmount ?? booking.depositAmount ?? 0;
    const { totalPaid: prevPaid } = derivePaymentTotals(booking);

    let paymentType: LedgerAppendInput['paymentType'] = 'balance';
    const amt = Number(params.amount);
    if (
        depositDue > 0 &&
        prevPaid < depositDue - 0.01 &&
        amt <= depositDue + 0.02
    ) {
        paymentType = 'deposit';
    }

    appendLedgerEntry(booking, {
        paymentType,
        amount: amt,
        currency: params.currency || 'USD',
        method: params.provider === 'stripe' ? 'stripe' : 'paypal',
        status: 'completed',
        transactionReference: params.txRef,
        provider: params.provider,
        paidAt: new Date(),
        stripePaymentIntentId: params.stripePaymentIntentId,
    });

    if (params.legacyPaymentId) {
        booking.paymentId = params.legacyPaymentId as any;
    }

    booking.lifecycleStatus = 'confirmed';
    booking.status = 'confirmed' as any;

    if (booking.departureId && booking.inventoryPhase === 'reserved') {
        await confirmDepartureSeats(booking.departureId, booking.numberOfPeople);
        booking.inventoryPhase = 'confirmed';
    }
}

/** Mirror legacy Payment document for gateway reconciliation */
export async function createLegacyPaymentRecord(params: {
    bookingId: mongoose.Types.ObjectId;
    amount: number;
    currency?: string;
    status: 'pending' | 'completed' | 'failed';
    provider: 'paypal' | 'stripe';
    txRef: string;
    stripePaymentIntentId?: string;
    transactionId?: string;
}): Promise<mongoose.Types.ObjectId> {
    const p = await Payment.create({
        booking: params.bookingId,
        amount: params.amount,
        currency: params.currency || 'USD',
        status: params.status,
        provider: params.provider,
        txRef: params.txRef,
        stripePaymentIntentId: params.stripePaymentIntentId,
        transactionId: params.transactionId,
    });
    return p._id as mongoose.Types.ObjectId;
}
