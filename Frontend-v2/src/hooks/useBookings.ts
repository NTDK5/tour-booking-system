import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import toast from 'react-hot-toast';
import type { Booking } from '@/types';

export const bookingKeys = {
    all: ['bookings'] as const,
    user: () => [...bookingKeys.all, 'user'] as const,
    detail: (id: string) => [...bookingKeys.all, id] as const,
    timeline: (id: string) => [...bookingKeys.all, id, 'timeline'] as const,
    tourOptions: (tourId: string) => [...bookingKeys.all, 'tour-options', tourId] as const,
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

export function useStripeIntentStatus(intentId: string) {
    return useQuery({
        queryKey: [...bookingKeys.all, 'stripe-intent', intentId],
        queryFn: () => bookingsApi.getStripeIntentStatus(intentId),
        enabled: !!intentId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (!status) return 2500;
            if (status === 'succeeded' || status === 'canceled' || status === 'requires_payment_method') return false;
            return 2500;
        },
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

export function useTourBookingOptions(tourId: string, enabled = true) {
    return useQuery({
        queryKey: bookingKeys.tourOptions(tourId),
        queryFn: () => bookingsApi.getTourOptions(tourId),
        enabled: enabled && !!tourId,
    });
}

export function useBookingQuote() {
    return useMutation({
        mutationFn: bookingsApi.quote,
    });
}

export function useBookingTimeline(id: string) {
    return useQuery({
        queryKey: bookingKeys.timeline(id),
        queryFn: () => bookingsApi.getTimeline(id),
        enabled: !!id,
    });
}

export function useRespondOffer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bookingId, decision, note }: { bookingId: string; decision: 'accepted' | 'rejected'; note?: string }) =>
            bookingsApi.respondOffer(bookingId, decision, note),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.user() });
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.bookingId) });
            queryClient.invalidateQueries({ queryKey: bookingKeys.timeline(variables.bookingId) });
            toast.success(variables.decision === 'accepted' ? 'Offer accepted. Reservation confirmed.' : 'Offer rejected.');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to submit offer response.';
            if (error.response?.status === 409) {
                toast.error(`Availability changed: ${message}`);
                return;
            }
            toast.error(message);
        },
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

export function useDeleteUserBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (bookingId: string) => bookingsApi.remove(bookingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.user() });
            toast.success('Booking deleted from history.');
        },
        onError: () => toast.error('Failed to delete booking.'),
    });
}

export function usePayBookingBalance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bookingId, amount }: { bookingId: string; amount: number }) =>
            bookingsApi.payBalance(bookingId, amount),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.user() });
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.bookingId) });
            toast.success('Payment session created. Continue to secure payment.');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to start payment.');
        },
    });
}
