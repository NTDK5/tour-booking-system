import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toursApi } from '@/api/tours';
import toast from 'react-hot-toast';
import type { Tour, TourFilters } from '@/types';

export const tourKeys = {
    all: ['tours'] as const,
    list: (filters?: TourFilters) => [...tourKeys.all, 'list', filters] as const,
    detail: (id: string) => [...tourKeys.all, 'detail', id] as const,
};

export function useTours(filters?: TourFilters) {
    return useQuery({
        queryKey: tourKeys.list(filters),
        queryFn: () => toursApi.getAll(filters),
    });
}

export function useTour(id: string) {
    return useQuery({
        queryKey: tourKeys.detail(id),
        queryFn: () => toursApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateTour() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<Tour>) => toursApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tourKeys.all });
            toast.success('Tour created successfully');
        },
        onError: () => toast.error('Failed to create tour'),
    });
}

export function useUpdateTour() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<Tour> }) =>
            toursApi.update(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tourKeys.all });
            queryClient.invalidateQueries({ queryKey: tourKeys.detail(variables.id) });
            toast.success('Tour updated successfully');
        },
        onError: () => toast.error('Failed to update tour'),
    });
}

export function useDeleteTour() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => toursApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tourKeys.all });
            toast.success('Tour deleted successfully');
        },
        onError: () => toast.error('Failed to delete tour'),
    });
}
