import { apiClient } from '@/api/client';
import type { Tour, PaginatedResponse, TourFilters } from '@/types';

/** Customer-facing catalog (published packages). */
export const packagesApi = {
    getAll: async (filters?: TourFilters): Promise<PaginatedResponse<Tour>> => {
        const { data } = await apiClient.get('/packages', { params: filters });
        if (Array.isArray(data)) {
            return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
        }
        return data;
    },

    async getById(id: string): Promise<Tour> {
        const { data } = await apiClient.get(`/packages/${id}`);
        return data;
    },

    async quote(
        id: string,
        body: { guests?: number; children?: number; travelDate?: string; selectedAddons?: string[] }
    ) {
        const { data } = await apiClient.post(`/packages/${id}/quote`, body);
        return data;
    },

    async getAvailability(id: string, params?: { departureId?: string; guests?: number; bookingDate?: string }) {
        const { data } = await apiClient.get(`/packages/${id}/availability`, { params });
        return data;
    },
};

/** Admin Package Builder — requires auth + admin role */
export const adminPackagesApi = {
    async list(params?: { status?: string; page?: number; limit?: number }) {
        const { data } = await apiClient.get('/admin/packages', { params });
        return data as PaginatedResponse<Record<string, unknown>>;
    },

    async getById(id: string) {
        const { data } = await apiClient.get(`/admin/packages/${id}`);
        return data;
    },

    async create(payload: Record<string, unknown>) {
        const { data } = await apiClient.post('/admin/packages', payload);
        return data;
    },

    async update(id: string, payload: Record<string, unknown>) {
        const { data } = await apiClient.put(`/admin/packages/${id}`, payload);
        return data;
    },

    async patchSection(id: string, section: string, payload: Record<string, unknown>) {
        const { data } = await apiClient.patch(`/admin/packages/${id}/${section}`, payload);
        return data;
    },

    async remove(id: string) {
        await apiClient.delete(`/admin/packages/${id}`);
    },
};
