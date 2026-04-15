import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import type { Booking } from '@/types';

export function useAdminBookings() {
    return useQuery({
        queryKey: ['admin', 'bookings'],
        queryFn: async () => {
            const { data } = await apiClient.get('/bookings');
            return data as Booking[];
        },
    });
}

export function useDeleteBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiClient.delete(`/bookings/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
            toast.success('Booking deleted');
        },
        onError: () => toast.error('Failed to delete booking'),
    });
}
export function useUpdateBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) =>
            apiClient.put(`/bookings/${id}`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
            queryClient.invalidateQueries({ queryKey: ['customTripRequests'] });
            queryClient.invalidateQueries({ queryKey: ['bookings', 'user'] });
            toast.success('Booking updated');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update booking');
        }
    });
}
