import { apiClient as client } from './client';
import type { CalendarEventType } from '@/types/adminCalendar';

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
    getResources: (params?: { resourceType?: string; search?: string }) => client.get('/admin/resources', { params }),
    syncResources: () => client.post('/admin/resources/sync'),
    getUnifiedCalendarBookings: (params: {
        start: string;
        end: string;
        resourceType?: string;
        resourceId?: string;
    }) => client.get('/admin/calendar/bookings', { params }),
    getUnifiedCalendarEvents: (params: {
        start: string;
        end: string;
        packageId?: string;
        guideId?: string;
        driverId?: string;
        vehicleId?: string;
        status?: string;
        eventType?: CalendarEventType;
    }) => client.get('/admin/calendar/events', { params }),
    checkUnifiedResourceAvailability: (data: {
        resourceId: string;
        resourceType: string;
        startDate: string;
        endDate: string;
        excludeBookingId?: string;
    }) => client.post('/admin/calendar/check-availability', data),

    getUsers: () => client.get('/users'),
    deleteUser: (id: string) => client.delete(`/users/${id}`),
    updateUser: (id: string, data: any) => client.put(`/users/${id}`, data),
};
