import { motion } from 'framer-motion';
import { useUserBookings as useBookings } from '@/hooks/useBookings';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useCancelBooking, useDeleteUserBooking, useRespondOffer } from '@/hooks/useBookings';
import { Calendar, Package, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { resolveImageUrl } from '@/utils/url';
import { useNavigate } from 'react-router-dom';

export default function BookingHistoryPage() {
    const { data: bookings, isLoading, isError, refetch } = useBookings();
    const navigate = useNavigate();
    const respondOffer = useRespondOffer();
    const cancelBooking = useCancelBooking();
    const deleteBooking = useDeleteUserBooking();
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

    const handleAccept = (id: string) => {
        respondOffer.mutate({
            bookingId: id,
            decision: 'accepted',
        }, { onSuccess: () => refetch() });
    };

    const handleCancel = (id: string) => {
        if (window.confirm('Cancel this booking?')) {
            cancelBooking.mutate(id);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this booking from your history?')) {
            deleteBooking.mutate(id);
        }
    };

    const handleReject = (id: string) => {
        if (window.confirm('Are you sure you want to reject this offer?')) {
            respondOffer.mutate({
                bookingId: id,
                decision: 'rejected',
            }, { onSuccess: () => refetch() });
        }
    };

    if (isLoading) return <div className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>;
    if (isError) return <ErrorState onRetry={() => refetch()} />;
    if (bookings?.length === 0) return <EmptyState icon={Package} title="No bookings yet" description="Your future adventures will appear here." />;

    const getBookingKind = (booking: any) => {
        if (booking.customTrip) return 'custom trip';
        if (booking.customCarRequest) return 'custom car request';
        if (booking.tour) return 'tour';
        if (booking.lodge) return 'lodge';
        if (booking.car) return 'car';
        return String(booking.bookingType || 'booking').toLowerCase();
    };

    const getBookingTitle = (booking: any) => {
        const customTripDays = typeof booking.customTrip === 'object' ? booking.customTrip?.days : undefined;
        if (booking.tour?.title) return booking.tour.title;
        if (booking.lodge?.name) return booking.lodge.name;
        if (booking.car) return `${booking.car.brand} ${booking.car.model}`;
        if (booking.customTrip) return customTripDays ? `Custom Trip (${customTripDays} days)` : 'Custom Trip Request';
        if (booking.customCarRequest) return `${booking.customCarRequest.carType || 'Custom Car'} Request`;
        return 'Booking';
    };

    const getBookingImage = (booking: any) => {
        if (booking.tour?.images?.length) return booking.tour.images[0];
        if (booking.tour?.imageUrl?.length) return booking.tour.imageUrl[0];
        if (booking.lodge?.images?.length) return booking.lodge.images[0];
        if (booking.car?.images?.length) return booking.car.images[0];
        return '';
    };

    const getBookingDate = (booking: any) => {
        const dateValue =
            booking.checkInDate ||
            booking.customCarRequest?.checkInDate ||
            booking.startDate ||
            booking.bookingDate ||
            booking.createdAt;
        if (!dateValue) return 'TBD';
        const parsed = new Date(dateValue);
        return Number.isNaN(parsed.getTime()) ? 'TBD' : format(parsed, 'MMM dd, yyyy');
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white">Booking History</h1>
                <p className="text-neutral-400">Manage and track your upcoming and past trips.</p>
            </header>

            <div className="space-y-4">
                {bookings?.map((booking: any, idx: number) => {
                    const bookingKind = getBookingKind(booking);
                    const bookingTitle = getBookingTitle(booking);
                    const coverImage = getBookingImage(booking);
                    return (
                    <motion.div
                        key={booking._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card bg-surface-light p-6 border-surface-border flex flex-col md:flex-row items-center gap-6 hover:border-primary/30 transition-all group"
                    >
                        {/* Service Image */}
                        <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 bg-surface">
                            <img
                                src={resolveImageUrl(coverImage) || 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=800'}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                alt="Service"
                            />
                        </div>

                        <div className="flex-grow space-y-4 w-full">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="uppercase text-[8px] tracking-widest">{bookingKind}</Badge>
                                        {booking.isRequest && <Badge variant="accent" className="uppercase text-[8px] tracking-widest italic">Request</Badge>}
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                        {bookingTitle}
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        Booking ID: #{booking._id.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                                <Badge variant={
                                    booking.status === 'confirmed' ? 'success' :
                                        (booking.status === 'offered' || booking.status === 'offer_sent') ? 'warning' :
                                            (booking.status === 'submitted' || booking.status === 'under_review') ? 'default' :
                                                booking.status === 'pending' ? 'accent' : 'secondary'
                                }>
                                    {booking.status.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap gap-6 border-t border-surface-border pt-4">
                                <div className="flex items-center gap-2 text-xs text-neutral-400">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>
                                        {getBookingDate(booking)}
                                    </span>
                                </div>

                                {(booking.status === 'offered' || booking.status === 'offer_sent') ? (
                                    <div className="flex-grow flex items-center justify-between bg-primary/10 p-3 rounded-xl border border-primary/20">
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-primary uppercase font-bold tracking-widest">Admin Offer</div>
                                            <div className="text-xl font-black text-white">${booking.proposedPrice}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="accent"
                                                size="sm"
                                                className="rounded-lg font-bold"
                                                onClick={() => handleAccept(booking._id)}
                                                isLoading={respondOffer.isPending}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-lg font-bold text-error border-error/20 hover:bg-error/10"
                                                onClick={() => handleReject(booking._id)}
                                                isLoading={respondOffer.isPending}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-lg font-bold"
                                                onClick={() => navigate(`/dashboard/requests/${booking._id}`)}
                                            >
                                                Review
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="ml-auto text-right">
                                        <div className="text-lg font-bold text-white">
                                            {booking.totalPrice > 0 ? `$${booking.totalPrice}` : 'Price TBD'}
                                        </div>
                                        <div className="flex gap-2 mt-2 justify-end">
                                            {booking.status !== 'cancelled' && (
                                                <Button size="sm" variant="outline" onClick={() => handleCancel(booking._id)} isLoading={cancelBooking.isPending}>
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button size="sm" variant="ghost" className="text-error" onClick={() => handleDelete(booking._id)} isLoading={deleteBooking.isPending}>
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {booking.status !== 'offered' && booking.status !== 'offer_sent' && (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setSelectedBooking(booking)}
                                    className="p-4 rounded-full bg-surface border border-surface-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all cursor-pointer"
                                >
                                    <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-primary" />
                                </button>
                                <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                                    View Details
                                </Button>
                                {booking.customTrip && (
                                    <Button size="sm" variant="ghost" onClick={() => navigate(`/dashboard/requests/${booking._id}`)}>
                                        Timeline
                                    </Button>
                                )}
                            </div>
                        )}
                    </motion.div>
                    );
                })}
            </div>

            {selectedBooking && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="w-full max-w-xl bg-surface-light border border-surface-border rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Booking Details</h3>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>Close</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-neutral-500">Booking ID</span><p className="font-bold">#{selectedBooking._id.slice(-8).toUpperCase()}</p></div>
                            <div><span className="text-neutral-500">Status</span><p className="font-bold uppercase">{selectedBooking.status}</p></div>
                            <div><span className="text-neutral-500">Type</span><p className="font-bold uppercase">{getBookingKind(selectedBooking)}</p></div>
                            <div><span className="text-neutral-500">Total Price</span><p className="font-bold">{selectedBooking.totalPrice > 0 ? `$${selectedBooking.totalPrice}` : 'TBD'}</p></div>
                            <div><span className="text-neutral-500">Start</span><p className="font-bold">{selectedBooking.checkInDate || selectedBooking.bookingDate || 'N/A'}</p></div>
                            <div><span className="text-neutral-500">End</span><p className="font-bold">{selectedBooking.checkOutDate || 'N/A'}</p></div>
                        </div>
                        {selectedBooking.customCarRequest && (
                            <div className="p-4 rounded-xl bg-surface border border-surface-border">
                                <p className="text-xs uppercase text-neutral-500 font-bold">Custom Car Request</p>
                                <p className="text-sm mt-1">Type: {selectedBooking.customCarRequest.carType || '-'}</p>
                                <p className="text-sm mt-1">Capacity: {selectedBooking.customCarRequest.passengerCapacity || '-'}</p>
                            </div>
                        )}
                        {selectedBooking.customTrip && (
                            <div className="p-4 rounded-xl bg-surface border border-surface-border">
                                <p className="text-xs uppercase text-neutral-500 font-bold">Custom Trip</p>
                                <p className="text-sm mt-1">Days: {typeof selectedBooking.customTrip === 'string' ? '-' : (selectedBooking.customTrip.days || 0)}</p>
                                <p className="text-sm mt-1">Final Price: {typeof selectedBooking.customTrip === 'string' ? '-' : (selectedBooking.customTrip.finalPrice ? `$${selectedBooking.customTrip.finalPrice}` : 'TBD')}</p>
                            </div>
                        )}
                        {selectedBooking.notes && (
                            <div className="p-4 rounded-xl bg-surface border border-surface-border">
                                <p className="text-xs uppercase text-neutral-500 font-bold">Notes</p>
                                <p className="text-sm mt-1">{selectedBooking.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
