import { useState } from 'react';
import {
    Search,
    Download,
    Eye,
    Edit,
    Trash2,
    Calendar,
    Globe,
    Hotel,
    Car,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAdminBookings, useDeleteBooking, useUpdateBooking } from '@/hooks/useAdminBookings';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

import { OfflineBookingForm } from '@/features/admin/OfflineBookingForm';
import { AdminBookingDetailModal } from '@/features/admin/bookings/AdminBookingDetailModal';

export default function BookingManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [lifecycleFilter, setLifecycleFilter] = useState('');
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [detailBookingId, setDetailBookingId] = useState<string | null>(null);
    const [proposedPrice, setProposedPrice] = useState('');

    const { data: bookings, isLoading, error, refetch } = useAdminBookings({
        lifecycleStatus: lifecycleFilter || undefined,
        search: searchTerm.trim() || undefined,
    });
    const deleteBooking = useDeleteBooking();
    const updateBooking = useUpdateBooking();

    const handleProposePrice = async () => {
        if (!proposedPrice || isNaN(Number(proposedPrice))) {
            toast.error('Please enter a valid price');
            return;
        }

        updateBooking.mutate({
            id: selectedBooking._id,
            payload: {
                status: 'offer_sent',
                proposedPrice: Number(proposedPrice)
            }
        }, {
            onSuccess: () => {
                setSelectedBooking(null);
                setProposedPrice('');
            }
        });
    };

    const filteredBookings = bookings?.filter((b) => {
        const typeValue = b.customTrip ? 'custom' : (b.bookingType || '').toLowerCase();
        const matchesType = filterType === 'All' || typeValue === filterType.toLowerCase();
        return matchesType;
    });

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            await deleteBooking.mutateAsync(id);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-light rounded-2xl border border-surface-border">
                <AlertCircle size={48} className="text-error mb-4" />
                <h3 className="text-xl font-bold">Failed to load bookings</h3>
                <p className="text-muted-foreground mt-2">There was an error connecting to the server.</p>
                <Button onClick={() => window.location.reload()} className="mt-6">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Booking Operations</h2>
                    <p className="text-muted-foreground">Manage all online and offline bookings in one place.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download size={18} />
                        Export
                    </Button>
                    <Button className="gap-2" onClick={() => setIsManualModalOpen(true)}>
                        + Manual Entry
                    </Button>
                </div>
            </div>

            {isManualModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
                    <OfflineBookingForm
                        onClose={() => setIsManualModalOpen(false)}
                        onSuccess={() => refetch()}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-surface-light p-4 rounded-2xl border border-surface-border shadow-sm">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-dark border border-surface-border focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Search by ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <select
                        className="w-full h-11 px-4 rounded-xl bg-surface-dark border border-surface-border outline-none"
                        value={lifecycleFilter}
                        onChange={(e) => setLifecycleFilter(e.target.value)}
                    >
                        <option value="">All lifecycle</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <select
                        className="w-full h-11 px-4 rounded-xl bg-surface-dark border border-surface-border outline-none"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="tour">Tour</option>
                        <option value="lodge">Lodge</option>
                        <option value="car">Car</option>
                        <option value="custom">Custom Trip</option>
                    </select>
                </div>
                <div className="flex items-center justify-center text-xs font-bold text-muted-foreground uppercase opacity-50 md:col-span-2">
                    {filteredBookings?.length || 0} Results
                </div>
            </div>

            <div className="rounded-2xl bg-surface-light border border-surface-border shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-dark/30 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-surface-border">
                            <tr>
                                <th className="px-6 py-4 font-black">Booking ID</th>
                                <th className="px-6 py-4 font-black">Guest</th>
                                <th className="px-6 py-4 font-black">Service</th>
                                <th className="px-6 py-4 font-black">Status</th>
                                <th className="px-6 py-4 font-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-6 py-4"><Skeleton className="h-6 w-full" /></td></tr>
                                ))
                            ) : filteredBookings?.map((booking) => (
                                <tr key={booking._id} className="hover:bg-surface-dark/10 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs text-white">
                                        {(booking as { bookingNumber?: string }).bookingNumber ||
                                            `#${booking._id.slice(-8).toUpperCase()}`}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-neutral-300">
                                        {(booking.user as any)?.first_name || 'Guest'} {(booking.user as any)?.last_name || ''}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {(booking.customTrip || (booking.bookingType || '').toLowerCase() === 'tour') && <Globe size={14} className="text-blue-500" />}
                                            {(booking.bookingType || '').toLowerCase() === 'lodge' && <Hotel size={14} className="text-amber-500" />}
                                            {(booking.bookingType || '').toLowerCase() === 'car' && <Car size={14} className="text-green-500" />}
                                            <span className="text-xs font-medium text-white">
                                                {booking.customTrip
                                                    ? `Custom Trip (${typeof booking.customTrip === 'string' ? 0 : (booking.customTrip.days || 0)} days)`
                                                    : booking.customCarRequest
                                                    ? `Custom: ${booking.customCarRequest.carType} (${booking.customCarRequest.passengerCapacity} pax)`
                                                    : (booking.tour as any)?.title || (booking.lodge as any)?.name || (booking.car as any)?.brand || 'Service'
                                                }
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground uppercase tracking-widest font-bold">
                                        <Badge variant={
                                            booking.status === 'confirmed' ? 'success' :
                                                (booking.status === 'offered' || booking.status === 'offer_sent') ? 'accent' :
                                                    (booking.status === 'submitted' || booking.status === 'under_review') ? 'warning' :
                                                        booking.status === 'pending' ? 'accent' : 'destructive'
                                        }>
                                            {booking.status}
                                            {booking.isRequest && " (Req)"}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {(booking.status === 'submitted' || booking.status === 'under_review') && (
                                                <Button
                                                    variant="accent"
                                                    size="sm"
                                                    className="h-8 rounded-lg text-[10px] font-black italic px-3"
                                                    onClick={() => setSelectedBooking(booking)}
                                                >
                                                    Propose Price
                                                </Button>
                                            )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => setDetailBookingId(booking._id)}
                                                >
                                                <Eye size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-error hover:bg-error/10" onClick={() => handleDelete(booking._id)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!isLoading && filteredBookings?.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">No bookings found</div>
                )}
            </div>

            {/* Price Proposal Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-surface-light border border-surface-border rounded-3xl p-8 w-full max-w-md space-y-6 shadow-2xl">
                        <div>
                            <h3 className="text-xl font-bold text-white">Propose Price</h3>
                            <p className="text-sm text-neutral-400">Set a price offer for this {selectedBooking.bookingType} request.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-surface-dark/50 border border-surface-border">
                                <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Guest</p>
                                <p className="text-sm font-bold">{selectedBooking.user?.first_name} {selectedBooking.user?.last_name}</p>
                                <p className="text-[10px] text-neutral-600 mt-2 uppercase font-bold">Service</p>
                                <p className="text-sm font-bold text-primary">
                                    {selectedBooking.customCarRequest
                                        ? `${selectedBooking.customCarRequest.carType} Request`
                                        : (selectedBooking.tour?.title || selectedBooking.lodge?.name || selectedBooking.car?.brand)
                                    }
                                </p>
                                {selectedBooking.customCarRequest && (
                                    <div className="mt-2 text-[10px] text-neutral-400">
                                        {selectedBooking.customCarRequest.passengerCapacity} pax | {selectedBooking.customCarRequest.transmission}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500">Proposed Price (USD)</label>
                                <input
                                    type="number"
                                    className="w-full h-12 px-4 rounded-xl bg-surface-dark border border-surface-border focus:ring-2 focus:ring-primary outline-none text-lg font-bold"
                                    placeholder="Enter amount..."
                                    value={proposedPrice}
                                    onChange={(e) => setProposedPrice(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl"
                                onClick={() => setSelectedBooking(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="accent"
                                className="flex-2 rounded-xl font-bold"
                                onClick={handleProposePrice}
                                isLoading={updateBooking.isPending}
                            >
                                Send Offer
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <AdminBookingDetailModal
                bookingId={detailBookingId}
                onClose={() => setDetailBookingId(null)}
            />
        </div>
    );
}
