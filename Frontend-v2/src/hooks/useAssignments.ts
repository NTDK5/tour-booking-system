import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { assignmentsApi } from '@/api/assignments';

export function useDepartureAssignments(departureId?: string) {
    return useQuery({
        queryKey: ['admin', 'assignments', 'departure', departureId],
        queryFn: () => assignmentsApi.getDepartureAssignments(departureId as string),
        enabled: Boolean(departureId),
    });
}

export function useStaffSchedule(staffId?: string) {
    return useQuery({
        queryKey: ['admin', 'assignments', 'staff', staffId],
        queryFn: () => assignmentsApi.getStaffSchedule(staffId as string),
        enabled: Boolean(staffId),
    });
}

export function useCreateAssignment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: assignmentsApi.create,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'assignments'], exact: false });
            qc.invalidateQueries({ queryKey: ['admin', 'staff'], exact: false });
            toast.success('Staff assigned successfully');
        },
        onError: (error: any) => {
            const payload = error?.response?.data;
            toast.error(payload?.message || payload?.error || 'Failed to assign staff');
        },
    });
}

export function useRemoveAssignment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => assignmentsApi.remove(id, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'assignments'], exact: false });
            qc.invalidateQueries({ queryKey: ['admin', 'staff'], exact: false });
            toast.success('Assignment removed');
        },
        onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to remove assignment'),
    });
}
