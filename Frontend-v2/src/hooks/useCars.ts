import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '@/api/cars';
import toast from 'react-hot-toast';
import type { Car } from '@/types';

export const carKeys = {
    all: ['cars'] as const,
    list: () => [...carKeys.all, 'list'] as const,
    detail: (id: string) => [...carKeys.all, 'detail', id] as const,
};

export function useCars() {
    return useQuery({
        queryKey: carKeys.list(),
        queryFn: carsApi.getAll,
    });
}

export function useCar(id: string) {
    return useQuery({
        queryKey: carKeys.detail(id),
        queryFn: () => carsApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateCar() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<Car>) => carsApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: carKeys.all });
            toast.success('Vehicle added successfully');
        },
        onError: () => toast.error('Failed to add vehicle'),
    });
}

export function useUpdateCar() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<Car> }) =>
            carsApi.update(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: carKeys.all });
            queryClient.invalidateQueries({ queryKey: carKeys.detail(variables.id) });
            toast.success('Vehicle updated successfully');
        },
        onError: () => toast.error('Failed to update vehicle'),
    });
}

export function useDeleteCar() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => carsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: carKeys.all });
            toast.success('Vehicle removed successfully');
        },
        onError: () => toast.error('Failed to remove vehicle'),
    });
}
