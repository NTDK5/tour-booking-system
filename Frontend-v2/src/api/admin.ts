import { apiClient as client } from './client';

export const adminApi = {
    getStats: () => client.get('/admin/stats'),

    getAvailability: (params: {
        start: string;
        end: string;
        resourceType?: string;
        resourceId?: string;
    }) => client.get('/admin/availability', { params }),

    updateAvailability: (data: {
        resourceId: string;
        resourceType: string;
        date: string;
        status: string;
        notes?: string;
        totalCapacity?: number;
    }) => client.post('/admin/availability', data),

    createOfflineBooking: (data: any) => client.post('/admin/bookings/offline', data),

    getReports: (params: { type: string; start: string; end: string }) =>
        client.get('/admin/reports', { params }),

    getLogs: () => client.get('/admin/logs'),

    getUsers: () => client.get('/users'),
    deleteUser: (id: string) => client.delete(`/users/${id}`),
    updateUser: (id: string, data: any) => client.put(`/users/${id}`, data),
};
