import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import toast from 'react-hot-toast';
import type { CalendarEventType, UnifiedCalendarEventsResponse } from '@/types/adminCalendar';

export function useUnifiedCalendarBookings(params: {
    start: string;
    end: string;
    resourceType?: string;
    resourceId?: string;
}) {
    return useQuery({
        queryKey: ['admin', 'calendar', 'bookings', params],
        queryFn: async () => {
            const { data } = await adminApi.getUnifiedCalendarBookings(params);
            return data;
        },
        enabled: !!params.start && !!params.end,
    });
}

export function useUnifiedCalendarEvents(params: {
    start: string;
    end: string;
    packageId?: string;
    guideId?: string;
    driverId?: string;
    vehicleId?: string;
    status?: string;
    eventType?: CalendarEventType;
}) {
    return useQuery<UnifiedCalendarEventsResponse>({
        queryKey: ['admin', 'calendar', 'events', params],
        queryFn: async () => {
            const { data } = await adminApi.getUnifiedCalendarEvents(params);
            return data;
        },
        enabled: !!params.start && !!params.end,
    });
}

export function useResources(params?: { resourceType?: string; search?: string }) {
    return useQuery({
        queryKey: ['admin', 'resources', params],
        queryFn: async () => {
            const { data } = await adminApi.getResources(params);
            return data;
        },
    });
}

export function useSyncResources() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await adminApi.syncResources();
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] });
            toast.success('Resources synced successfully.');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to sync resources.');
        },
    });
}

export function useCheckUnifiedResourceAvailability() {
    return useMutation({
        mutationFn: async (payload: {
            resourceId: string;
            resourceType: string;
            startDate: string;
            endDate: string;
            excludeBookingId?: string;
        }) => {
            const { data } = await adminApi.checkUnifiedResourceAvailability(payload);
            return data;
        },
    });
}
