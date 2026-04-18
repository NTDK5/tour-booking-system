import { derivePaymentTotals } from '../payments/bookingPaymentService';
import type { IBooking } from '../models/bookingSchema';

export function paymentSummaryFromBooking(booking: IBooking) {
    return derivePaymentTotals(booking);
}

function asPlain(booking: IBooking | Record<string, unknown>) {
    return typeof (booking as any)?.toObject === 'function'
        ? (booking as any).toObject()
        : { ...(booking as Record<string, unknown>) };
}

/** Customer-facing — omit internal-only fields */
export function toCustomerBookingDTO(booking: IBooking | Record<string, unknown>) {
    const plain = asPlain(booking);
    const { internalNotes: _i, auditTrail: _a, ...rest } = plain as Record<string, unknown>;
    return {
        ...rest,
        paymentSummary: paymentSummaryFromBooking(booking as IBooking),
    };
}

/** Admin — full payload + derived totals */
export function toAdminBookingDTO(booking: IBooking | Record<string, unknown>) {
    const plain = asPlain(booking);
    return {
        ...plain,
        paymentSummary: paymentSummaryFromBooking(booking as IBooking),
    };
}
