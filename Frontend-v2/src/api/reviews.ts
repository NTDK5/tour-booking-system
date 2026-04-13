import { apiClient } from './client';
import type { Review } from '@/types';

export const reviewsApi = {
    create: async (data: any): Promise<Review> => {
        const { data: response } = await apiClient.post('/reviews', data);
        return response;
    },

    getReviews: async (params: { tourId?: string; lodgeId?: string; carId?: string }): Promise<Review[]> => {
        const { data: response } = await apiClient.get('/reviews', { params });
        return response;
    },

    getMyReviews: async (): Promise<Review[]> => {
        const { data: response } = await apiClient.get('/reviews/my-reviews');
        return response;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/reviews/${id}`);
    }
};
