import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useBooking, useStripeIntentStatus } from '@/hooks/useBookings';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PaymentRetryPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const bookingId = params.get('bookingId') || '';
    const clientSecret = params.get('clientSecret') || '';
    const intentId = useMemo(() => {
        if (!clientSecret.includes('_secret_')) return '';
        return clientSecret.split('_secret_')[0];
    }, [clientSecret]);

    const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);
    const { data: intentStatus } = useStripeIntentStatus(intentId);

    const status = intentStatus?.status || 'requires_payment_method';

    if (isLoading) return <div className="p-8"><Skeleton className="h-56 w-full" /></div>;
    if (isError || !booking) return <ErrorState onRetry={refetch} />;

    const isSuccess = status === 'succeeded';
    const isFailure = status === 'canceled' || status === 'requires_payment_method' || status === 'payment_failed';

    return (
        <div className="min-h-screen bg-surface py-10">
            <div className="section-container max-w-3xl">
                <div className="card bg-surface-light p-8 border-surface-border rounded-3xl space-y-6">
                    <h1 className="text-3xl font-bold text-white">Payment Processing</h1>
                    <p className="text-neutral-300">Booking: <strong>{booking.bookingNumber || booking._id}</strong></p>
                    <p className="text-neutral-300">Payment status: <strong className="uppercase">{status}</strong></p>

                    {isSuccess && (
                        <div className="rounded-xl p-4 bg-success/10 border border-success/30 text-success">
                            Payment succeeded. Continue to your confirmation page.
                        </div>
                    )}
                    {isFailure && (
                        <div className="rounded-xl p-4 bg-error/10 border border-error/30 text-error">
                            Payment was not completed. Retry payment from booking history.
                        </div>
                    )}

                    <div className="flex gap-3">
                        {isSuccess ? (
                            <Button onClick={() => navigate(`/booking/${(booking.tour as any)?._id || bookingId}/confirmation?bookingId=${booking._id}`)}>
                                Continue to Confirmation
                            </Button>
                        ) : (
                            <Button onClick={() => navigate('/dashboard/bookings')}>Retry from Booking History</Button>
                        )}
                        <Button variant="outline" onClick={() => navigate('/dashboard/bookings')}>View Bookings</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
