import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import toast from 'react-hot-toast';
import type { Booking } from '@/types';

export const bookingKeys = {
    all: ['bookings'] as const,
    user: () => [...bookingKeys.all, 'user'] as const,
    detail: (id: string) => [...bookingKeys.all, id] as const,
};

export function useUserBookings() {
    return useQuery({
        queryKey: bookingKeys.user(),
        queryFn: bookingsApi.getUserBookings,
    });
}

export function useBooking(id: string) {
    return useQuery({
        queryKey: bookingKeys.detail(id),
        queryFn: () => bookingsApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Omit<Booking, '_id' | 'createdAt' | 'updatedAt'>) =>
            bookingsApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.user() });
            toast.success('Booking created successfully!');
        },
        onError: () => toast.error('Failed to create booking. Please try again.'),
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (bookingId: string) => bookingsApi.cancel(bookingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.user() });
            toast.success('Booking cancelled successfully.');
        },
        onError: () => toast.error('Failed to cancel booking.'),
    });
}
