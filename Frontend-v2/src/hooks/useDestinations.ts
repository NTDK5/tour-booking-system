import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { destinationsApi } from '@/api/destinations';

export function useDestinations() {
    return useQuery({
        queryKey: ['destinations'],
        queryFn: destinationsApi.getAll
    });
}

export function useCreateDestination() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: destinationsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['destinations'] });
            toast.success('Destination created');
        }
    });
}

export function useUpdateDestination() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => destinationsApi.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['destinations'] });
            toast.success('Destination updated');
        }
    });
}

export function useDeleteDestination() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: destinationsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['destinations'] });
            toast.success('Destination removed');
        }
    });
}
