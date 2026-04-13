import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/api/reviews';
import toast from 'react-hot-toast';

export const reviewKeys = {
    all: ['reviews'] as const,
    my: () => [...reviewKeys.all, 'my'] as const,
    resource: (params: any) => [...reviewKeys.all, 'resource', params] as const,
};

export function useMyReviews() {
    return useQuery({
        queryKey: reviewKeys.my(),
        queryFn: reviewsApi.getMyReviews,
    });
}

export function useResourceReviews(params: { tourId?: string; lodgeId?: string; carId?: string }) {
    return useQuery({
        queryKey: reviewKeys.resource(params),
        queryFn: () => reviewsApi.getReviews(params),
        enabled: !!(params.tourId || params.lodgeId || params.carId),
    });
}

export function useCreateReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reviewsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewKeys.all });
            toast.success('Review submitted successfully!');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to submit review';
            toast.error(message);
        },
    });
}

export function useDeleteReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reviewsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewKeys.all });
            toast.success('Review deleted');
        },
        onError: () => toast.error('Failed to delete review'),
    });
}
