import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import type { Booking } from '@/types';
import { bookingsApi } from '@/api/bookings';

export type AdminBookingFilters = {
    lifecycleStatus?: string;
    workflowStatus?: string;
    search?: string;
};

export function useAdminBookings(filters: AdminBookingFilters = {}) {
    return useQuery({
        queryKey: ['admin', 'bookings', filters],
        queryFn: async () => bookingsApi.adminList(filters),
    });
}

export function useDeleteBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiClient.delete(`/bookings/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin'], exact: false });
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
            queryClient.invalidateQueries({ queryKey: ['admin'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['customTripRequests'] });
            queryClient.invalidateQueries({ queryKey: ['bookings', 'user'] });
            toast.success('Booking updated');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update booking');
        }
    });
}

export function useAdminUpdateBookingStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            lifecycleStatus,
            reason,
            refundAmount,
        }: {
            id: string;
            lifecycleStatus: 'draft' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled';
            reason?: string;
            refundAmount?: number;
        }) => bookingsApi.adminUpdateStatus(id, { lifecycleStatus, reason, refundAmount }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin'], exact: false });
            toast.success('Booking lifecycle updated');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update lifecycle status');
        },
    });
}

export function useAdminPatchBookingAllocation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            guideId,
            vehicleId,
        }: {
            id: string;
            guideId?: string;
            vehicleId?: string;
        }) => apiClient.patch(`/admin/bookings/${id}/allocations`, { guideId, vehicleId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin'], exact: false });
            toast.success('Booking allocation updated');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update allocation');
        },
    });
}
