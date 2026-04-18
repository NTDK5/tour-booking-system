/**
 * Legacy alias — reads use public `/packages`; writes use `/admin/packages`.
 */
import { apiClient } from '@/api/client';
import { packagesApi, adminPackagesApi } from '@/api/packages';
import type { Tour, PaginatedResponse, TourFilters } from '@/types';

export const toursApi = {
    getAll: (filters?: TourFilters): Promise<PaginatedResponse<Tour>> => packagesApi.getAll(filters),

    getById: (id: string): Promise<Tour> => packagesApi.getById(id),

    async create(payload: Partial<Tour>): Promise<Tour> {
        const { data } = await apiClient.post('/admin/packages', payload);
        return data;
    },

    async update(id: string, payload: Partial<Tour>): Promise<Tour> {
        const { data } = await apiClient.put(`/admin/packages/${id}`, payload);
        return data;
    },

    async delete(id: string): Promise<void> {
        await adminPackagesApi.remove(id);
    },
};

export { packagesApi, adminPackagesApi };
