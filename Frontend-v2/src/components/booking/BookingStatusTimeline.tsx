import { format } from 'date-fns';
import type { BookingTimelineEvent } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface BookingStatusTimelineProps {
    events: BookingTimelineEvent[];
}

export function BookingStatusTimeline({ events }: BookingStatusTimelineProps) {
    if (!events.length) {
        return <p className="text-sm text-neutral-500">No timeline events yet.</p>;
    }

    return (
        <div className="space-y-3">
            {events.map((event, idx) => (
                <div key={`${event.timestamp}-${idx}`} className="rounded-xl border border-surface-border bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            {event.type === 'status' ? (
                                <Badge variant="accent" className="uppercase">{event.status}</Badge>
                            ) : (
                                <Badge variant="outline">{event.action || 'Audit'}</Badge>
                            )}
                            {event.actorRole && <Badge variant="secondary" className="uppercase">{event.actorRole}</Badge>}
                        </div>
                        <span className="text-xs text-neutral-500">
                            {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-300">{event.comment || event.details || 'Updated'}</p>
                </div>
            ))}
        </div>
    );
}
