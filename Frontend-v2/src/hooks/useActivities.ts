import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { activitiesApi } from '@/api/activities';

export function useActivities(destinationId?: string) {
    return useQuery({
        queryKey: ['activities', destinationId || 'all'],
        queryFn: () => activitiesApi.getAll(destinationId)
    });
}

export function useCreateActivity() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: activitiesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success('Activity created');
        }
    });
}

export function useDeleteActivity() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: activitiesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast.success('Activity removed');
        }
    });
}
