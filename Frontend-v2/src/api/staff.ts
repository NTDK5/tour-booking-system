import { apiClient } from '@/api/client';
import type { Staff, StaffAvailability, StaffRole, StaffStatus } from '@/types';

export const staffApi = {
    list: async (params?: {
        role?: StaffRole;
        availability?: StaffAvailability;
        status?: StaffStatus;
        search?: string;
    }): Promise<Staff[]> => {
        const { data } = await apiClient.get('/admin/staff', {
            params: Object.fromEntries(
                Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== '')
            ),
        });
        return data;
    },
    getById: async (id: string): Promise<Staff> => {
        const { data } = await apiClient.get(`/admin/staff/${id}`);
        return data;
    },
    create: async (payload: Partial<Staff>): Promise<Staff> => {
        const { data } = await apiClient.post('/admin/staff', payload);
        return data;
    },
    update: async (id: string, payload: Partial<Staff>): Promise<Staff> => {
        const { data } = await apiClient.put(`/admin/staff/${id}`, payload);
        return data;
    },
    deactivate: async (id: string): Promise<Staff> => {
        const { data } = await apiClient.patch(`/admin/staff/${id}/deactivate`);
        return data;
    },
    activate: async (id: string): Promise<Staff> => {
        const { data } = await apiClient.patch(`/admin/staff/${id}/activate`);
        return data;
    },
};
