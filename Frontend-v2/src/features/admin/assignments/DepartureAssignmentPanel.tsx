import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDepartureAssignments, useRemoveAssignment } from '@/hooks/useAssignments';
import { AssignmentModal } from './AssignmentModal';
import { setAuthRedirectPayload } from '@/utils/authRedirect';

export function DepartureAssignmentPanel({ departureId }: { departureId: string }) {
    const [assignRole, setAssignRole] = useState<'guide' | 'driver' | null>(null);
    const { data } = useDepartureAssignments(departureId);
    const removeAssignment = useRemoveAssignment();
    const guide = useMemo(() => data?.assignments?.find((a) => a.role === 'guide'), [data]);
    const driver = useMemo(() => data?.assignments?.find((a) => a.role === 'driver'), [data]);

    return (
        <div className="rounded-xl border border-surface-border bg-surface-dark/30 p-4 space-y-3">
            <h4 className="font-semibold">Departure Assignments</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg border border-surface-border">
                    <p className="text-xs uppercase text-muted-foreground">Guide</p>
                    <p className="font-semibold">{(guide?.staffId as any)?.fullName || 'Unassigned'}</p>
                    {guide ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2"
                            onClick={() => removeAssignment.mutate({ id: guide._id, reason: 'Reassignment' })}
                        >
                            Remove
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                                setAuthRedirectPayload(window.location.pathname, {
                                    action: 'assign_staff',
                                    departureId,
                                    staffRole: 'guide',
                                });
                                setAssignRole('guide');
                            }}
                        >
                            Assign Guide
                        </Button>
                    )}
                </div>
                <div className="p-3 rounded-lg border border-surface-border">
                    <p className="text-xs uppercase text-muted-foreground">Driver</p>
                    <p className="font-semibold">{(driver?.staffId as any)?.fullName || 'Unassigned'}</p>
                    {driver ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2"
                            onClick={() => removeAssignment.mutate({ id: driver._id, reason: 'Reassignment' })}
                        >
                            Remove
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                                setAuthRedirectPayload(window.location.pathname, {
                                    action: 'assign_staff',
                                    departureId,
                                    staffRole: 'driver',
                                });
                                setAssignRole('driver');
                            }}
                        >
                            Assign Driver
                        </Button>
                    )}
                </div>
            </div>
            <Badge variant="outline">Calendar-ready assignment events enabled</Badge>
            {assignRole && (
                <AssignmentModal departureId={departureId} role={assignRole} onClose={() => setAssignRole(null)} />
            )}
        </div>
    );
}
