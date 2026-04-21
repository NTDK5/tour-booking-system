import { apiClient } from '@/api/client';
import type { StaffAssignment } from '@/types';

export const assignmentsApi = {
    create: async (payload: {
        staffId: string;
        role: 'guide' | 'driver';
        departureId: string;
        bookingId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<StaffAssignment> => {
        const { data } = await apiClient.post('/admin/assignments', payload);
        return data;
    },
    remove: async (id: string, reason?: string): Promise<StaffAssignment> => {
        const { data } = await apiClient.delete(`/admin/assignments/${id}`, { data: { reason } });
        return data;
    },
    getStaffSchedule: async (staffId: string): Promise<{ assignments: StaffAssignment[]; events: any[] }> => {
        const { data } = await apiClient.get(`/admin/staff/${staffId}/schedule`);
        return data;
    },
    getDepartureAssignments: async (departureId: string): Promise<{ assignments: StaffAssignment[]; events: any[] }> => {
        const { data } = await apiClient.get(`/admin/departures/${departureId}/assignments`);
        return data;
    },
};
