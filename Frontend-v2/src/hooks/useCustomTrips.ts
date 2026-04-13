import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customTripsApi } from '../api/customTrips';
import { toast } from 'react-hot-toast';

export function useCustomTripOptions() {
    return useQuery({
        queryKey: ['customTripOptions'],
        queryFn: customTripsApi.getOptions
    });
}

export function useCustomTripDestinations() {
    return useQuery({
        queryKey: ['customTripDestinations'],
        queryFn: customTripsApi.getDestinations
    });
}

export function useDestinationItineraries(destinationId?: string) {
    return useQuery({
        queryKey: ['destinationItineraries', destinationId],
        queryFn: () => customTripsApi.getItinerariesByDestination(destinationId as string),
        enabled: !!destinationId
    });
}

export function useSubmitCustomTrip() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: customTripsApi.submitRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings', 'user'] });
            toast.success('Custom trip request submitted successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        }
    });
}

export function useCustomTripRequests() {
    return useQuery({
        queryKey: ['customTripRequests'],
        queryFn: customTripsApi.getAllRequests
    });
}

export function useCreateTripOption() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: customTripsApi.createOption,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customTripOptions'] });
            toast.success('Option created');
        }
    });
}
