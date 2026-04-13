import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

interface AvailabilityCalendarProps {
    lodgeId: string;
    onSelectDates: (checkIn: Date, checkOut: Date) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ lodgeId, onSelectDates }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const today = startOfToday();

    // Fetch availability for the visible month range
    const { data: availability, isLoading } = useQuery({
        queryKey: ['availability', lodgeId, format(currentMonth, 'yyyy-MM')],
        queryFn: async () => {
            // For this implementation, we check availability for a 30-day window around the selected month
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(addMonths(currentMonth, 1));
            const res = await apiClient.get('/bookings/check-availability', {
                params: {
                    lodgeId,
                    checkInDate: format(start, 'yyyy-MM-dd'),
                    checkOutDate: format(end, 'yyyy-MM-dd'),
                },
            });
            return res.data;
        },
        enabled: !!lodgeId,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleDateClick = (date: Date) => {
        if (isBefore(date, today)) return;

        if (!checkIn || (checkIn && checkOut)) {
            setCheckIn(date);
            setCheckOut(null);
        } else if (checkIn && !checkOut) {
            if (isAfter(date, checkIn)) {
                setCheckOut(date);
                onSelectDates(checkIn, date);
            } else {
                setCheckIn(date);
            }
        }
    };

    const isSelected = (date: Date) => {
        if (checkIn && isSameDay(date, checkIn)) return true;
        if (checkOut && isSameDay(date, checkOut)) return true;
        return false;
    };

    const isInRange = (date: Date) => {
        if (checkIn && checkOut) {
            return isAfter(date, checkIn) && isBefore(date, checkOut);
        }
        return false;
    };

    const renderHeader = () => (
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white italic">
                Select <span className="text-primary tracking-widest uppercase text-sm">Dates</span>
            </h3>
            <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 rounded-xl bg-surface border border-surface-border text-neutral-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-xs font-bold text-white flex items-center">
                    {format(currentMonth, 'MMMM yyyy')}
                </div>
                <button onClick={nextMonth} className="p-2 rounded-xl bg-surface border border-surface-border text-neutral-400 hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderDays = () => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        // Fill empty slots for start of month
        const startDay = start.getDay();
        const emptyDays = Array(startDay).fill(null);

        return (
            <div className="grid grid-cols-7 gap-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-neutral-600 uppercase mb-2">{d}</div>
                ))}
                {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                {days.map(day => {
                    const isToday = isSameDay(day, today);
                    const past = isBefore(day, today);
                    const selected = isSelected(day);
                    const range = isInRange(day);

                    return (
                        <button
                            key={day.toString()}
                            disabled={past}
                            onClick={() => handleDateClick(day)}
                            className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-bold transition-all relative
                ${past ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-400 hover:bg-primary/10'}
                ${selected ? 'bg-primary text-surface scale-110 z-10' : ''}
                ${range ? 'bg-primary/20 text-primary rounded-none' : ''}
                ${isToday && !selected ? 'border-2 border-primary/30' : ''}
              `}
                        >
                            {format(day, 'd')}
                            {isToday && !selected && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />}
                        </button>
                    )
                })}
            </div>
        );
    };

    return (
        <div className="p-8 rounded-[32px] bg-surface-light border border-surface-border shadow-xl">
            {renderHeader()}
            {renderDays()}

            <div className="mt-8 pt-6 border-t border-surface-border grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Check-in</div>
                    <div className="text-sm text-white font-bold">{checkIn ? format(checkIn, 'MMM dd, yyyy') : '—'}</div>
                </div>
                <div className="space-y-1 text-right">
                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Check-out</div>
                    <div className="text-sm text-white font-bold">{checkOut ? format(checkOut, 'MMM dd, yyyy') : '—'}</div>
                </div>
            </div>

            {isLoading && (
                <div className="mt-6 flex items-center justify-center gap-2 p-3 rounded-2xl bg-surface border border-surface-border">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Syncing Live rates...</span>
                </div>
            )}

            {availability && checkIn && checkOut && (
                <div className="mt-6 space-y-3">
                    {availability.map((room: any) => (
                        <div key={room.type} className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-surface-border">
                            <div>
                                <div className="text-sm font-bold text-white">{room.type}</div>
                                <div className="text-[10px] text-neutral-500">${room.price} per night</div>
                            </div>
                            <div className="text-right">
                                {room.available > 0 ? (
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                        {room.available} Left
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                                        Sold Out
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
