/**
 * Placeholder hooks for guide / vehicle / hotel assignment post-booking.
 * Extend with allocation collections and workers in a future phase.
 */

export interface AllocationPlaceholder {
    bookingId: string;
    packageId: string;
    requiresGuide: boolean;
    requiresVehicle: boolean;
    requiresHotel: boolean;
}

export function buildAllocationPlaceholder(params: {
    bookingId: string;
    packageId: string;
    guideRequired?: boolean;
    vehicleRequired?: boolean;
    hotelRequired?: boolean;
}): AllocationPlaceholder {
    return {
        bookingId: params.bookingId,
        packageId: params.packageId,
        requiresGuide: Boolean(params.guideRequired),
        requiresVehicle: Boolean(params.vehicleRequired),
        requiresHotel: Boolean(params.hotelRequired),
    };
}
