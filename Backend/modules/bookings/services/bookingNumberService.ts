import Booking from '../../../models/bookingModel';

/** Human-readable booking numbers: BK-YYYY-NNNN (year + rolling sequence) */
export async function generateBookingNumber(yearOverride?: number): Promise<string> {
    const year = yearOverride ?? new Date().getFullYear();
    const prefix = `BK-${year}-`;

    const latest = await Booking.findOne({ bookingNumber: new RegExp(`^${prefix}`) })
        .sort({ bookingNumber: -1 })
        .select('bookingNumber')
        .lean();

    let nextSeq = 1;
    if (latest?.bookingNumber) {
        const parts = String(latest.bookingNumber).split('-');
        const n = parseInt(parts[2], 10);
        if (!Number.isNaN(n)) nextSeq = n + 1;
    }

    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}
