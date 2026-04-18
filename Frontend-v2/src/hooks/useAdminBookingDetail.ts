import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';

export function useAdminBookingDetail(id: string | null) {
    return useQuery({
        queryKey: ['admin', 'booking', id],
        enabled: Boolean(id),
        queryFn: async () => bookingsApi.adminGetById(id as string),
    });
}
