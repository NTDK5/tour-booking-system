import mongoose from 'mongoose';
import PackageDeparture from '../../packages/models/packageDepartureModel';

/** Seats counted against capacity (post-migration): reserved + confirmed only */
export function occupiedSeats(dep: {
    reservedGuests?: number;
    confirmedGuests?: number;
    bookedCount?: number;
}): number {
    const r = dep.reservedGuests ?? 0;
    const c = dep.confirmedGuests ?? 0;
    const legacy = dep.bookedCount ?? 0;
    if (legacy > r + c) return legacy;
    return r + c;
}

export async function assertDepartureCapacity(
    departureId: mongoose.Types.ObjectId | string,
    guestCount: number,
    session?: mongoose.ClientSession | null
): Promise<void> {
    const q = PackageDeparture.findById(departureId);
    if (session) q.session(session);
    const dep = await q;
    if (!dep) throw new Error('Departure not found');

    const occ = occupiedSeats(dep);
    if (occ + guestCount > dep.capacity) {
        throw new Error('Departure capacity exceeded');
    }
}

export async function reserveDepartureSeats(
    departureId: mongoose.Types.ObjectId | string,
    guestCount: number,
    session?: mongoose.ClientSession | null
): Promise<void> {
    await assertDepartureCapacity(departureId, guestCount, session);
    await PackageDeparture.findByIdAndUpdate(
        departureId,
        { $inc: { reservedGuests: guestCount } },
        session ? { session } : {}
    );
}

export async function releaseReservedSeats(
    departureId: mongoose.Types.ObjectId | string,
    guestCount: number,
    session?: mongoose.ClientSession | null
): Promise<void> {
    await PackageDeparture.findByIdAndUpdate(
        departureId,
        { $inc: { reservedGuests: -guestCount } },
        session ? { session } : {}
    );
}

/** Move seats from reserved to confirmed (e.g. payment confirmed / admin confirm) */
export async function confirmDepartureSeats(
    departureId: mongoose.Types.ObjectId | string,
    guestCount: number,
    session?: mongoose.ClientSession | null
): Promise<void> {
    await PackageDeparture.findByIdAndUpdate(
        departureId,
        {
            $inc: {
                reservedGuests: -guestCount,
                confirmedGuests: guestCount,
                bookedCount: guestCount,
            },
        },
        session ? { session } : {}
    );
}

/** Cancel pending reservation — release reserved only */
export async function cancelReservedSeats(
    departureId: mongoose.Types.ObjectId | string,
    guestCount: number,
    session?: mongoose.ClientSession | null
): Promise<void> {
    await releaseReservedSeats(departureId, guestCount, session);
}

/** Cancel confirmed booking — release confirmed inventory */
export async function releaseConfirmedSeats(
    departureId: mongoose.Types.ObjectId | string,
    guestCount: number,
    session?: mongoose.ClientSession | null
): Promise<void> {
    await PackageDeparture.findByIdAndUpdate(
        departureId,
        {
            $inc: {
                confirmedGuests: -guestCount,
                bookedCount: -guestCount,
            },
        },
        session ? { session } : {}
    );
}
