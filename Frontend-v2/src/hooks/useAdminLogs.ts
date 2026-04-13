import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

export function useAdminLogs() {
    return useQuery({
        queryKey: ['admin', 'logs'],
        queryFn: async () => {
            const { data } = await adminApi.getLogs();
            return data;
        },
        refetchInterval: 10000, // Refresh every 10 seconds for "live" feel
    });
}
