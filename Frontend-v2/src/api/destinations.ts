import { apiClient } from '@/api/client';

export const destinationsApi = {
    getAll: async () => {
        const { data } = await apiClient.get('/destinations');
        return data;
    },
    create: async (payload: any) => {
        const { data } = await apiClient.post('/destinations', payload);
        return data;
    },
    update: async (id: string, payload: any) => {
        const { data } = await apiClient.put(`/destinations/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await apiClient.delete(`/destinations/${id}`);
        return data;
    }
};
