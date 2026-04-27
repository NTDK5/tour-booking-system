export type BookingDraftTraveler = {
    fullName: string;
    travelerType: 'adult' | 'child' | 'infant';
    nationality?: string;
    passportNumber?: string;
};

export type BookingDraft = {
    packageId: string;
    departureId?: string;
    travelers: BookingDraftTraveler[];
    pricingSnapshot?: Record<string, unknown>;
    bookingType: 'tour' | 'lodge' | 'car';
    startDate?: string;
    endDate?: string;
    guests?: number;
    children?: number;
    selectedAddons?: string[];
    notes?: string;
    currentStep: number;
    updatedAt: string;
};

const KEY_PREFIX = 'booking_draft_v1';

export const getBookingDraftKey = (packageId: string, bookingType: string, userId?: string) =>
    `${KEY_PREFIX}:${userId || 'guest'}:${bookingType}:${packageId}`;

export const saveBookingDraft = (key: string, draft: BookingDraft) => {
    localStorage.setItem(key, JSON.stringify(draft));
};

export const loadBookingDraft = (key: string): BookingDraft | null => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as BookingDraft;
    } catch {
        return null;
    }
};

export const clearBookingDraft = (key: string) => {
    localStorage.removeItem(key);
};
