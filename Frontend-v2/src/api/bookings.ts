import { apiClient } from '@/api/client';
import type {
    Booking,
    BookingTimelineEvent,
    BookingQuoteResponse,
    BookingDepartureOption,
    TourAddonOption,
} from '@/types';

export const bookingsApi = {
    create: async (payload: Omit<Booking, '_id' | 'createdAt' | 'updatedAt'>): Promise<Booking> => {
        const { data } = await apiClient.post('/bookings', payload);
        return data;
    },

    getUserBookings: async (): Promise<Booking[]> => {
        const { data } = await apiClient.get('/bookings/user');
        return data;
    },

    getById: async (id: string): Promise<Booking> => {
        const { data } = await apiClient.get(`/bookings/${id}`);
        return data;
    },

    cancel: async (bookingId: string): Promise<void> => {
        await apiClient.delete(`/bookings/${bookingId}/cancel`);
    },
    respondOffer: async (bookingId: string, decision: 'accepted' | 'rejected', note?: string): Promise<Booking> => {
        const { data } = await apiClient.put(`/bookings/${bookingId}/respond-offer`, { decision, note });
        return data;
    },
    confirmRequest: async (bookingId: string, comment?: string): Promise<Booking> => {
        const { data } = await apiClient.put(`/bookings/${bookingId}/confirm-request`, { comment });
        return data;
    },
    getTimeline: async (bookingId: string): Promise<BookingTimelineEvent[]> => {
        const { data } = await apiClient.get(`/bookings/${bookingId}/timeline`);
        return data;
    },
    remove: async (bookingId: string): Promise<void> => {
        await apiClient.delete(`/bookings/${bookingId}`);
    },

    /** Admin enterprise list */
    adminList: async (params?: {
        lifecycleStatus?: string;
        workflowStatus?: string;
        search?: string;
    }): Promise<Booking[]> => {
        const { data } = await apiClient.get('/admin/bookings', {
            params: Object.fromEntries(
                Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== '')
            ),
        });
        return data;
    },

    adminGetById: async (id: string): Promise<Booking> => {
        const { data } = await apiClient.get(`/admin/bookings/${id}`);
        return data;
    },
    adminUpdateStatus: async (
        id: string,
        payload: { lifecycleStatus: 'draft' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'; reason?: string; refundAmount?: number }
    ): Promise<Booking> => {
        const { data } = await apiClient.patch(`/admin/bookings/${id}/status`, payload);
        return data;
    },

    /** Customer — Stripe PaymentIntent for remaining balance */
    payBalance: async (
        bookingId: string,
        amount: number
    ): Promise<{ clientSecret: string | null }> => {
        const { data } = await apiClient.post(`/bookings/${bookingId}/payments/balance`, { amount });
        return data;
    },
    getStripeIntentStatus: async (
        intentId: string
    ): Promise<{ id: string; status: string; bookingId?: string; clientSecret?: string | null }> => {
        const { data } = await apiClient.get(`/payments/stripe-intent/${intentId}`);
        return data;
    },

    quote: async (payload: {
        bookingType: 'tour' | 'lodge' | 'car';
        tourId?: string;
        numberOfPeople?: number;
        children?: number;
        bookingDate?: string;
        selectedAddons?: string[];
        departureId?: string;
    }): Promise<BookingQuoteResponse> => {
        const { data } = await apiClient.post('/bookings/quote', payload);
        return data;
    },

    getTourOptions: async (
        tourId: string
    ): Promise<{
        addons: TourAddonOption[];
        departures: BookingDepartureOption[];
        bookingCutoffHours: number;
    }> => {
        const { data } = await apiClient.get(`/bookings/options/tour/${tourId}`);
        return data;
    },
};
