import PackageDeparture from '../models/packageDepartureModel';
import type { Document } from 'mongoose';
import { startOfDay } from 'date-fns';
import { occupiedSeats } from '../../bookings/services/bookingInventoryService';

export interface AvailabilityCheckInput {
    packageId: string;
    departureId?: string;
    guests: number;
    bookingDate?: Date;
}

export interface AvailabilityCheckResult {
    available: boolean;
    reasons: string[];
    departure?: any;
}

export async function checkPackageAvailability(
    pkg: Document | Record<string, any>,
    input: AvailabilityCheckInput
): Promise<AvailabilityCheckResult> {
    const p = pkg && typeof (pkg as Document).toObject === 'function' ? (pkg as Document).toObject() : pkg;
    const reasons: string[] = [];

    const minG = p.minGuests ?? 1;
    const maxG = p.maxGuests ?? 999;
    if (input.guests < minG) reasons.push(`Minimum ${minG} guests required`);
    if (input.guests > maxG) reasons.push(`Maximum ${maxG} guests`);

    const cutoffHours = p.bookingCutoffHours ?? 24;
    if (input.departureId) {
        const dep = await PackageDeparture.findById(input.departureId).lean();
        if (!dep) {
            reasons.push('Departure not found');
            return { available: false, reasons };
        }
        if (dep.status === 'cancelled' || dep.status === 'full') reasons.push('Departure not bookable');
        const starts = new Date(dep.startsAt);
        const cutoff = new Date(starts.getTime() - cutoffHours * 60 * 60 * 1000);
        if (new Date() > cutoff) reasons.push('Booking cutoff passed for this departure');
        if (occupiedSeats(dep as any) + input.guests > dep.capacity) reasons.push('Not enough seats on this departure');
        return {
            available: reasons.length === 0,
            reasons,
            departure: dep,
        };
    }

    if (input.bookingDate && cutoffHours > 0) {
        const day = startOfDay(input.bookingDate);
        const cutoff = new Date(day.getTime() - cutoffHours * 60 * 60 * 1000);
        if (new Date() > cutoff) reasons.push('Booking cutoff passed for selected date');
    }

    return {
        available: reasons.length === 0,
        reasons,
    };
}
