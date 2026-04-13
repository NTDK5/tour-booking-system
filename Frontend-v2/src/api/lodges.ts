import { apiClient } from '@/api/client';
import type { Lodge, PaginatedResponse, LodgeFilters } from '@/types';

export const lodgesApi = {
    getAll: async (filters?: LodgeFilters): Promise<PaginatedResponse<Lodge>> => {
        const { data } = await apiClient.get('/lodges', { params: filters });
        if (Array.isArray(data)) {
            return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
        }
        return data;
    },

    getById: async (id: string): Promise<Lodge> => {
        const { data } = await apiClient.get(`/lodges/${id}`);
        return data;
    },

    create: async (payload: Partial<Lodge>): Promise<Lodge> => {
        const { data } = await apiClient.post('/lodges', payload);
        return data;
    },

    update: async (id: string, payload: Partial<Lodge>): Promise<Lodge> => {
        const { data } = await apiClient.put(`/lodges/${id}`, payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/lodges/${id}`);
    },

    checkAvailability: async (lodgeId: string, checkInDate: string, checkOutDate: string): Promise<any[]> => {
        const { data } = await apiClient.get('/bookings/check-availability', {
            params: { lodgeId, checkInDate, checkOutDate }
        });
        return data;
    },
};
