import { format } from 'date-fns';
import { useStaffSchedule } from '@/hooks/useAssignments';

export function StaffAvailabilityCalendar({ staffId }: { staffId?: string }) {
    const { data, isLoading } = useStaffSchedule(staffId);

    if (!staffId) return <p className="text-xs text-muted-foreground">Select a staff member to inspect schedule.</p>;
    if (isLoading) return <p className="text-xs text-muted-foreground">Loading schedule…</p>;

    const rows = data?.events || [];
    return (
        <div className="rounded-lg border border-surface-border p-3 bg-surface-dark/30 max-h-48 overflow-y-auto">
            <p className="text-[10px] uppercase text-muted-foreground mb-2">Current Assignments</p>
            {rows.length ? rows.map((ev: any) => (
                <div key={ev.id} className="text-xs py-1 border-b border-surface-border/50 last:border-b-0">
                    <span className="font-semibold capitalize">{ev.role}</span>{' '}
                    <span className="text-muted-foreground">{format(new Date(ev.startDate), 'MMM d')} - {format(new Date(ev.endDate), 'MMM d')}</span>
                </div>
            )) : <p className="text-xs text-muted-foreground">No assignments on record.</p>}
        </div>
    );
}
