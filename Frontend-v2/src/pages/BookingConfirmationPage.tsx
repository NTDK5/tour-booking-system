import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useBooking } from '@/hooks/useBookings';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export default function BookingConfirmationPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const bookingId = params.get('bookingId') || '';
    const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);

    const travelersCount = useMemo(() => booking?.travelers?.length || booking?.numberOfPeople || 0, [booking]);

    if (isLoading) return <div className="p-8"><Skeleton className="h-56 w-full" /></div>;
    if (isError || !booking) return <ErrorState onRetry={refetch} />;

    return (
        <div className="min-h-screen bg-surface py-10">
            <div className="section-container max-w-3xl">
                <div className="card bg-surface-light p-8 border-surface-border rounded-3xl space-y-6">
                    <h1 className="text-3xl font-bold text-white">Booking Confirmation</h1>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-neutral-500">Booking ID</p><p className="font-bold">{booking.bookingNumber || booking._id}</p></div>
                        <div><p className="text-neutral-500">Status</p><p className="font-bold uppercase">{booking.lifecycleStatus || booking.status}</p></div>
                        <div><p className="text-neutral-500">Package</p><p className="font-bold">{(booking.tour as any)?.title || (booking.lodge as any)?.name || booking.bookingType}</p></div>
                        <div><p className="text-neutral-500">Departure/Start</p><p className="font-bold">{booking.startDate || booking.bookingDate || 'N/A'}</p></div>
                        <div><p className="text-neutral-500">Travelers</p><p className="font-bold">{travelersCount}</p></div>
                        <div><p className="text-neutral-500">Payment</p><p className="font-bold uppercase">{booking.paymentSummary?.paymentStatus || booking.paymentStatus || 'unpaid'}</p></div>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => navigate('/dashboard/bookings')}>View Booking</Button>
                        <Button variant="outline" onClick={() => window.print()}>Download Receipt</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
