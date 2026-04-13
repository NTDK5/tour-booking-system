import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

export function useAvailability(params: {
    start: string;
    end: string;
    resourceType?: string;
    resourceId?: string;
}) {
    return useQuery({
        queryKey: ['admin', 'availability', params],
        queryFn: async () => {
            const { data } = await adminApi.getAvailability(params);
            return data;
        },
        enabled: !!params.start && !!params.end,
    });
}
