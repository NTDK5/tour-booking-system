import { apiClient } from '@/api/client';
import type { Booking } from '@/types';

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
};
