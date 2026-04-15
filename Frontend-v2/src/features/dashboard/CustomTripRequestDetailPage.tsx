import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useBooking, useBookingTimeline, useRespondOffer } from '@/hooks/useBookings';
import { BookingStatusTimeline } from '@/components/booking/BookingStatusTimeline';

export default function CustomTripRequestDetailPage() {
    const { bookingId = '' } = useParams();
    const navigate = useNavigate();
    const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);
    const { data: timeline = [] } = useBookingTimeline(bookingId);
    const respondOffer = useRespondOffer();
    const customTrip = typeof booking?.customTrip === 'object' ? booking.customTrip : undefined;
    const itinerary = useMemo(
        () => customTrip?.reviewedItinerary || customTrip?.itinerary || [],
        [customTrip]
    );

    if (isLoading) {
        return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-80 w-full" /></div>;
    }
    if (isError || !booking) {
        return <ErrorState onRetry={() => refetch()} />;
    }

    const estimate = booking.estimateSnapshot?.finalPrice || booking.estimateSnapshot?.estimatedBudget || 0;
    const offered = booking.offer?.finalPrice || booking.proposedPrice || 0;
    const delta = offered - estimate;

    const statusLabel = (() => {
        const normalized = String(booking.status || '').toLowerCase();
        if (normalized === 'submitted' || normalized === 'under_review') return 'Pending Review';
        if (normalized === 'offered' || normalized === 'offer_sent') return 'Offer Sent';
        if (normalized === 'accepted') return 'Accepted';
        if (normalized === 'rejected') return 'Rejected';
        if (normalized === 'confirmed') return 'Confirmed';
        return booking.status || 'Pending';
    })();

    const handleAccept = () => {
        respondOffer.mutate({ bookingId, decision: 'accepted' });
    };

    const handleReject = () => {
        if (!window.confirm('Reject this offer? You can request resubmission later.')) return;
        respondOffer.mutate({ bookingId, decision: 'rejected' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Custom Trip Request</h1>
                    <p className="text-neutral-400">Booking #{booking._id.slice(-8).toUpperCase()}</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/dashboard/bookings')}>Back to Bookings</Button>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-light p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <Badge variant={booking.status === 'confirmed' ? 'success' : (booking.status === 'offered' || booking.status === 'offer_sent') ? 'warning' : 'accent'} className="uppercase">{statusLabel}</Badge>
                    <div className="text-sm text-neutral-400">Original estimate vs final offer</div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-surface-border p-4 bg-surface">
                        <p className="text-xs text-neutral-500 uppercase">Estimate</p>
                        <p className="text-xl font-bold text-white">${estimate || 0}</p>
                    </div>
                    <div className="rounded-xl border border-surface-border p-4 bg-surface">
                        <p className="text-xs text-neutral-500 uppercase">Final Offer</p>
                        <p className="text-xl font-bold text-primary">${offered || 0}</p>
                    </div>
                    <div className="rounded-xl border border-surface-border p-4 bg-surface">
                        <p className="text-xs text-neutral-500 uppercase">Difference</p>
                        <p className={`text-xl font-bold ${delta >= 0 ? 'text-warning' : 'text-success'}`}>{delta >= 0 ? '+' : ''}${delta || 0}</p>
                    </div>
                </div>
                {Array.isArray(booking.estimateSnapshot?.priceChangeReasons) && booking.estimateSnapshot?.priceChangeReasons.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs uppercase text-neutral-500">Why the estimate changed</p>
                        {booking.estimateSnapshot?.priceChangeReasons?.map((reason) => (
                            <p key={reason} className="text-sm text-neutral-300">- {reason}</p>
                        ))}
                    </div>
                )}
                {booking.offer?.adminNotes && (
                    <div className="rounded-xl border border-surface-border bg-surface p-4">
                        <p className="text-xs uppercase text-neutral-500">Admin notes</p>
                        <p className="text-sm text-neutral-300 mt-2">{booking.offer.adminNotes}</p>
                    </div>
                )}
                {(booking.status === 'offered' || booking.status === 'offer_sent') && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                        <p className="text-sm text-neutral-300">
                            Review the final offer carefully. Accepting confirms your reservation immediately and blocks dates in the calendar.
                        </p>
                        <div className="flex gap-3">
                        <Button
                            variant="accent"
                            onClick={handleAccept}
                            isLoading={respondOffer.isPending}
                        >
                            Accept Offer
                        </Button>
                        <Button
                            variant="outline"
                            className="text-error border-error/30"
                            onClick={handleReject}
                            isLoading={respondOffer.isPending}
                        >
                            Reject Offer
                        </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-light p-5 space-y-4">
                <h2 className="text-lg font-bold text-white">Itinerary Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-surface-border p-4 bg-surface">
                        <p className="text-xs uppercase text-neutral-500">Days</p>
                        <p className="text-white text-lg font-bold">{customTrip?.days || 0}</p>
                    </div>
                    <div className="rounded-xl border border-surface-border p-4 bg-surface">
                        <p className="text-xs uppercase text-neutral-500">Estimated</p>
                        <p className="text-white text-lg font-bold">${estimate || 0}</p>
                    </div>
                    <div className="rounded-xl border border-surface-border p-4 bg-surface">
                        <p className="text-xs uppercase text-neutral-500">Offer</p>
                        <p className="text-primary text-lg font-bold">{offered ? `$${offered}` : 'Pending'}</p>
                    </div>
                    <div className="rounded-xl border border-surface-border p-4 bg-surface">
                        <p className="text-xs uppercase text-neutral-500">Difference</p>
                        <p className={`text-lg font-bold ${delta >= 0 ? 'text-warning' : 'text-success'}`}>
                            {delta >= 0 ? '+' : ''}${delta || 0}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {itinerary.length === 0 && (
                        <p className="text-sm text-neutral-500">No itinerary details found.</p>
                    )}
                    {itinerary.map((day: any, index: number) => (
                        <div key={`${day.day || index}-${index}`} className="rounded-xl border border-surface-border bg-surface p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-white">Day {day.day || index + 1}</p>
                                <Badge variant="outline">{day.destination?.name || 'Destination not set'}</Badge>
                            </div>
                            <p className="text-sm text-neutral-300 mt-2">
                                Activity: {day.itineraryItem?.title || 'No activity selected'}
                            </p>
                            {Array.isArray(day.itineraryItem?.activities) && day.itineraryItem.activities.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {day.itineraryItem.activities.map((activity: any, idx: number) => (
                                        <Badge key={idx} variant="secondary">{activity.title || 'Activity'}</Badge>
                                    ))}
                                </div>
                            )}
                            {day.notes && <p className="text-xs text-neutral-500 mt-2">Notes: {day.notes}</p>}
                        </div>
                    ))}
                </div>
            </div>

            {Array.isArray(customTrip?.changeSummary) && customTrip.changeSummary.length > 0 && (
                <div className="rounded-2xl border border-surface-border bg-surface-light p-5">
                    <h2 className="text-lg font-bold text-white mb-3">Admin Changes</h2>
                    <div className="space-y-2">
                        {customTrip.changeSummary.map((change: any, idx: number) => (
                            <div key={`${change.field}-${idx}`} className="rounded-xl border border-surface-border bg-surface p-3">
                                <p className="text-sm text-white font-semibold">{change.field}</p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    {change.previousValue || 'N/A'} {'->'} {change.newValue || 'N/A'}
                                </p>
                                <p className="text-sm text-neutral-300 mt-1">{change.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-surface-border bg-surface-light p-5">
                <h2 className="text-lg font-bold text-white mb-4">Request Timeline</h2>
                <BookingStatusTimeline events={timeline} />
            </div>
        </div>
    );
}
