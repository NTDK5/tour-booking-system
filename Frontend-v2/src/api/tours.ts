import { apiClient } from '@/api/client';
import type { Tour, PaginatedResponse, TourFilters } from '@/types';

export const toursApi = {
    getAll: async (filters?: TourFilters): Promise<PaginatedResponse<Tour>> => {
        const { data } = await apiClient.get('/tours', { params: filters });
        // Normalize backend response (backend returns array, we wrap for consistency)
        if (Array.isArray(data)) {
            return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
        }
        return data;
    },

    async getById(id: string): Promise<Tour> {
        const { data } = await apiClient.get(`/tours/${id}`);
        return data;
    },

    async create(payload: Partial<Tour>): Promise<Tour> {
        const { data } = await apiClient.post('/tours', payload);
        return data;
    },

    async update(id: string, payload: Partial<Tour>): Promise<Tour> {
        const { data } = await apiClient.put(`/tours/${id}`, payload);
        return data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/tours/${id}`);
    },
};
