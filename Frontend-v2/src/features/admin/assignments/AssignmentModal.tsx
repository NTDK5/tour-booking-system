import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AccessibleSelect } from '@/components/ui/AccessibleSelect';
import { useStaffList } from '@/hooks/useStaff';
import { useCreateAssignment } from '@/hooks/useAssignments';
import { StaffAvailabilityCalendar } from './StaffAvailabilityCalendar';

export function AssignmentModal({
    departureId,
    role,
    onClose,
}: {
    departureId: string;
    role: 'guide' | 'driver';
    onClose: () => void;
}) {
    const [staffId, setStaffId] = useState('');
    const { data: staff } = useStaffList({ role, status: 'active' as any });
    const createAssignment = useCreateAssignment();
    const options = useMemo(
        () =>
            (staff || []).map((s) => ({
                value: s._id,
                label: `${s.fullName} (${s.availability})`,
            })),
        [staff]
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[170] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-surface-light border border-surface-border rounded-2xl p-5 space-y-4">
                <h3 className="text-lg font-bold">Assign {role}</h3>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Staff member</label>
                    <AccessibleSelect value={staffId} onChange={setStaffId} options={options} placeholder={`Select ${role}`} />
                </div>
                <StaffAvailabilityCalendar staffId={staffId || undefined} />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        disabled={!staffId}
                        isLoading={createAssignment.isPending}
                        onClick={async () => {
                            await createAssignment.mutateAsync({ staffId, role, departureId });
                            onClose();
                        }}
                    >
                        Assign
                    </Button>
                </div>
            </div>
        </div>
    );
}
