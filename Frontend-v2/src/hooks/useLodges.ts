import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lodgesApi } from '@/api/lodges';
import toast from 'react-hot-toast';
import type { Lodge, LodgeFilters } from '@/types';

export const lodgeKeys = {
    all: ['lodges'] as const,
    list: (filters?: LodgeFilters) => [...lodgeKeys.all, 'list', filters] as const,
    detail: (id: string) => [...lodgeKeys.all, 'detail', id] as const,
};

export function useLodges(filters?: LodgeFilters) {
    return useQuery({
        queryKey: lodgeKeys.list(filters),
        queryFn: () => lodgesApi.getAll(filters),
    });
}

export function useLodge(id: string) {
    return useQuery({
        queryKey: lodgeKeys.detail(id),
        queryFn: () => lodgesApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateLodge() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<Lodge>) => lodgesApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lodgeKeys.all });
            toast.success('Lodge created successfully');
        },
        onError: () => toast.error('Failed to create lodge'),
    });
}

export function useUpdateLodge() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<Lodge> }) =>
            lodgesApi.update(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: lodgeKeys.all });
            queryClient.invalidateQueries({ queryKey: lodgeKeys.detail(variables.id) });
            toast.success('Lodge updated successfully');
        },
        onError: () => toast.error('Failed to update lodge'),
    });
}

export function useDeleteLodge() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => lodgesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lodgeKeys.all });
            toast.success('Lodge deleted successfully');
        },
        onError: () => toast.error('Failed to delete lodge'),
    });
}
