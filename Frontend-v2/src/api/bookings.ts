import { apiClient } from '@/api/client';
import type { Booking, BookingTimelineEvent } from '@/types';

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
};
