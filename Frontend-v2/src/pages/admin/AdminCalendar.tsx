import { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Filter,
    Info,
    CheckCircle2,
    Hotel,
    Globe,
    Car
} from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
} from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAdminBookings } from '@/hooks/useAdminBookings';

type ResourceType = 'Lodge' | 'Tour' | 'Car';

import { useAvailability } from '@/hooks/useAvailability';

export default function AdminCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedType, setSelectedType] = useState<ResourceType>('Lodge');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedDayBookings, setSelectedDayBookings] = useState<any[] | null>(null);
    const [selectedBookingDetail, setSelectedBookingDetail] = useState<any | null>(null);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfWeek(endOfMonth(currentMonth));
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    // Fetch live availability
    const { data: availability = [], isLoading } = useAvailability({
        start: startOfMonth(currentMonth).toISOString(),
        end: endOfMonth(currentMonth).toISOString(),
        resourceType: selectedType
    });
    const { data: bookings = [] } = useAdminBookings();

    const getDayContent = (day: Date) => {
        return availability.find((a: any) => isSameDay(new Date(a.date), day));
    };

    const getDayBookings = (day: Date) => {
        return (bookings || []).filter((booking: any) => {
            const type = String(booking.bookingType || '').toLowerCase();
            const selected = selectedType.toLowerCase();
            if (type !== selected) return false;
            const dateValue = booking.checkInDate || booking.bookingDate || booking.createdAt;
            return dateValue ? isSameDay(new Date(dateValue), day) : false;
        });
    };

    const getDaySummary = (day: Date) => {
        const content = getDayContent(day);
        const dayBookings = getDayBookings(day);
        const bookingCount = dayBookings.length;

        const isLodge = selectedType === 'Lodge';
        const isBlocked = content?.status === 'blocked' || content?.status === 'maintenance';
        const isFullyBooked = content?.status === 'fully_booked';
        const isCapacityFull = typeof content?.bookedCapacity === 'number' &&
            typeof content?.totalCapacity === 'number' &&
            content.totalCapacity > 0 &&
            content.bookedCapacity >= content.totalCapacity;

        const available = !(isBlocked || isFullyBooked || isCapacityFull);
        const label = isLodge
            ? (available ? 'Available' : 'Not Available')
            : (isBlocked ? 'Blocked' : isFullyBooked ? 'Fully Booked' : 'Open');

        const style = available
            ? 'bg-success/10 text-success'
            : 'bg-error/10 text-error';

        return { content, dayBookings, bookingCount, label, style };
    };

    if (isLoading) {
        return (
            <div className="min-h-[600px] flex items-center justify-center bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarIcon className="text-primary" />
                        Unified Availability
                    </h2>
                    <p className="text-muted-foreground">Manage and track operational capacity across all services.</p>
                </div>

                <div className="flex items-center gap-2 bg-surface-dark/50 p-1 rounded-xl">
                    {(['Lodge', 'Tour', 'Car'] as ResourceType[]).map((type) => (
                        <Button
                            key={type}
                            variant={selectedType === type ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedType(type)}
                            className="gap-2"
                        >
                            {type === 'Lodge' && <Hotel size={16} />}
                            {type === 'Tour' && <Globe size={16} />}
                            {type === 'Car' && <Car size={16} />}
                            {type}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between bg-surface-light border border-surface-border p-4 rounded-2xl">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold min-w-[150px]">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <ChevronLeft size={20} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            <ChevronRight size={20} />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                        <Filter size={18} />
                        Resources
                    </Button>
                    <Badge variant="success" className="gap-1">
                        <CheckCircle2 size={12} /> Live Sync
                    </Badge>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="rounded-2xl bg-surface-light border border-surface-border shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 border-b border-surface-border bg-surface-dark/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="px-4 py-3 text-center border-r border-surface-border last:border-0">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                        const summary = getDaySummary(day);
                        const content = summary.content;
                        const isCurrentMonth = isSameMonth(day, currentMonth);

                        return (
                            <div
                                key={idx}
                                className={`
                                    min-h-[120px] p-2 border-r border-b border-surface-border last:border-r-0 flex flex-col group transition-colors
                                    ${!isCurrentMonth ? 'bg-surface-dark/10' : 'hover:bg-surface-dark/5'}
                                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                                `}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`
                                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                        ${isToday(day) ? 'bg-primary text-primary-foreground' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                    {content && (
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-dark rounded-md text-muted-foreground">
                                            <Info size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex-grow flex flex-col gap-1 justify-end">
                                    {content ? (
                                        <div className={`
                                            p-2 rounded-lg text-[10px] font-bold uppercase tracking-tight flex flex-col items-center justify-center text-center leading-tight
                                            ${summary.style}
                                        `}>
                                            <span>{summary.label}</span>
                                            {typeof content.bookedCapacity === 'number' && typeof content.totalCapacity === 'number' && (
                                                <span className="text-xs opacity-80">{content.bookedCapacity}/{content.totalCapacity}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-2 rounded-lg bg-success/5 text-success/40 text-[10px] font-bold text-center border border-dashed border-success/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {selectedType === 'Lodge' ? 'AVAILABLE' : 'OPEN'}
                                        </div>
                                    )}
                                    <div className="mt-1 px-2 py-1 rounded-md bg-surface-dark/40 text-[10px] text-center">
                                        {summary.bookingCount} bookings
                                    </div>
                                    <button
                                        onClick={() => setSelectedDayBookings(summary.dayBookings)}
                                        className="mt-1 text-[10px] px-2 py-1 rounded-md border border-surface-border hover:border-primary"
                                    >
                                        Show details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 p-4 bg-surface-dark/20 rounded-xl text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span>Available / Under Capacity</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-error"></div>
                    <span>Fully Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-neutral-600"></div>
                    <span>Manually Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Partially Booked</span>
                </div>
            </div>

            {selectedDayBookings && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-surface-light border border-surface-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Day Booking Details</h3>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDayBookings(null)}>Close</Button>
                        </div>
                        {selectedDayBookings.length === 0 ? (
                            <p className="text-sm text-neutral-400">No bookings for this date.</p>
                        ) : (
                            <div className="space-y-3 max-h-[55vh] overflow-y-auto">
                                {selectedDayBookings.map((b: any) => (
                                    <div key={b._id} className="p-3 rounded-xl bg-surface border border-surface-border">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-bold text-sm">
                                                {(b.tour as any)?.title || (b.lodge as any)?.name || (b.car as any)?.brand || (b.customTrip ? 'Custom Trip' : 'Booking')}
                                            </p>
                                            <Badge variant="outline">{b.status}</Badge>
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            #{b._id.slice(-8).toUpperCase()} | {(b.user as any)?.first_name || 'Guest'} {(b.user as any)?.last_name || ''}
                                        </p>
                                        <div className="mt-3 flex justify-end">
                                            <Button size="sm" variant="outline" onClick={() => setSelectedBookingDetail(b)}>
                                                View Booking Details
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedBookingDetail && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-surface-light border border-surface-border rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">Booking Detail</h3>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedBookingDetail(null)}>Close</Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-neutral-500">Booking ID</p><p className="font-bold">#{selectedBookingDetail._id.slice(-8).toUpperCase()}</p></div>
                            <div><p className="text-neutral-500">Status</p><p className="font-bold uppercase">{selectedBookingDetail.status}</p></div>
                            <div><p className="text-neutral-500">Type</p><p className="font-bold uppercase">{selectedBookingDetail.customTrip ? 'custom' : selectedBookingDetail.bookingType}</p></div>
                            <div><p className="text-neutral-500">Total Price</p><p className="font-bold">{selectedBookingDetail.totalPrice > 0 ? `$${selectedBookingDetail.totalPrice}` : 'TBD'}</p></div>
                            <div><p className="text-neutral-500">Booking Date</p><p className="font-bold">{selectedBookingDetail.bookingDate ? format(new Date(selectedBookingDetail.bookingDate), 'MMM dd, yyyy') : 'N/A'}</p></div>
                            <div><p className="text-neutral-500">Check-in</p><p className="font-bold">{selectedBookingDetail.checkInDate ? format(new Date(selectedBookingDetail.checkInDate), 'MMM dd, yyyy') : 'N/A'}</p></div>
                            <div><p className="text-neutral-500">Check-out</p><p className="font-bold">{selectedBookingDetail.checkOutDate ? format(new Date(selectedBookingDetail.checkOutDate), 'MMM dd, yyyy') : 'N/A'}</p></div>
                            <div><p className="text-neutral-500">Guests</p><p className="font-bold">{selectedBookingDetail.numberOfPeople || 1}</p></div>
                        </div>

                        <div className="p-4 rounded-xl bg-surface border border-surface-border">
                            <p className="text-xs uppercase text-neutral-500 font-bold mb-1">Guest</p>
                            <p className="text-sm font-bold">
                                {(selectedBookingDetail.user as any)?.first_name || 'Guest'} {(selectedBookingDetail.user as any)?.last_name || ''}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">{(selectedBookingDetail.user as any)?.email || 'No email'}</p>
                        </div>

                        {(selectedBookingDetail.tour || selectedBookingDetail.lodge || selectedBookingDetail.car || selectedBookingDetail.customTrip) && (
                            <div className="p-4 rounded-xl bg-surface border border-surface-border">
                                <p className="text-xs uppercase text-neutral-500 font-bold mb-1">Service</p>
                                <p className="text-sm font-bold">
                                    {(selectedBookingDetail.tour as any)?.title ||
                                        (selectedBookingDetail.lodge as any)?.name ||
                                        ((selectedBookingDetail.car as any)?.brand
                                            ? `${(selectedBookingDetail.car as any)?.brand} ${(selectedBookingDetail.car as any)?.model || ''}`
                                            : '') ||
                                        (selectedBookingDetail.customTrip ? 'Custom Trip' : 'N/A')}
                                </p>
                            </div>
                        )}

                        {selectedBookingDetail.notes && (
                            <div className="p-4 rounded-xl bg-surface border border-surface-border">
                                <p className="text-xs uppercase text-neutral-500 font-bold mb-1">Notes</p>
                                <p className="text-sm">{selectedBookingDetail.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
