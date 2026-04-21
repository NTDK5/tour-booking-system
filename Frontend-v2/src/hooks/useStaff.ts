import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { staffApi } from '@/api/staff';
import type { StaffAvailability, StaffRole, StaffStatus } from '@/types';

export function useStaffList(filters?: {
    role?: StaffRole;
    availability?: StaffAvailability;
    status?: StaffStatus;
    search?: string;
}) {
    return useQuery({
        queryKey: ['admin', 'staff', filters || {}],
        queryFn: () => staffApi.list(filters),
    });
}

export function useStaffById(id?: string) {
    return useQuery({
        queryKey: ['admin', 'staff', id],
        queryFn: () => staffApi.getById(id as string),
        enabled: Boolean(id),
    });
}

export function useCreateStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: staffApi.create,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'staff'], exact: false });
            toast.success('Staff member created');
        },
        onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create staff'),
    });
}

export function useUpdateStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => staffApi.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'staff'], exact: false });
            toast.success('Staff member updated');
        },
        onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update staff'),
    });
}

export function useToggleStaffStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) =>
            active ? staffApi.activate(id) : staffApi.deactivate(id),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['admin', 'staff'], exact: false });
            toast.success(vars.active ? 'Staff activated' : 'Staff deactivated');
        },
        onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update status'),
    });
}
