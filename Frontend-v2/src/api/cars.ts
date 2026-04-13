import { apiClient } from '@/api/client';
import type { Car } from '@/types';

export const carsApi = {
    getAll: async (): Promise<Car[]> => {
        const { data } = await apiClient.get('/cars');
        return data;
    },

    getById: async (id: string): Promise<Car> => {
        const { data } = await apiClient.get(`/cars/${id}`);
        return data;
    },

    create: async (payload: Partial<Car>): Promise<Car> => {
        const { data } = await apiClient.post('/cars', payload);
        return data;
    },

    update: async (id: string, payload: Partial<Car>): Promise<Car> => {
        const { data } = await apiClient.put(`/cars/${id}`, payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/cars/${id}`);
    },
};
