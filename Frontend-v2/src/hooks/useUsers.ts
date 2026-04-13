import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import toast from 'react-hot-toast';

export const userKeys = {
    all: ['admin', 'users'] as const,
};

export function useUsers() {
    return useQuery({
        queryKey: userKeys.all,
        queryFn: async () => {
            const { data } = await adminApi.getUsers();
            return data;
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminApi.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast.success('User removed');
        },
        onError: () => toast.error('Failed to remove user'),
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast.success('User updated');
        },
        onError: () => toast.error('Failed to update user'),
    });
}
