import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

export function useAdminStats() {
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const { data } = await adminApi.getStats();
            return data;
        },
    });
}
