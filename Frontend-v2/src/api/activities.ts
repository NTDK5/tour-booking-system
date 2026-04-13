import { apiClient } from '@/api/client';

export const activitiesApi = {
    getAll: async (destinationId?: string) => {
        const { data } = await apiClient.get('/activities', { params: destinationId ? { destinationId } : undefined });
        return data;
    },
    create: async (payload: any) => {
        const { data } = await apiClient.post('/activities', payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await apiClient.put(`/activities/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await apiClient.delete(`/activities/${id}`);
        return data;
    }
};
