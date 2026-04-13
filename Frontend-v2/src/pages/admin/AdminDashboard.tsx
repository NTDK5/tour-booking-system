import {
    Users,
    Calendar,
    DollarSign,
    AlertTriangle,
    Search,
    Globe,
    Car as CarIcon,
    Hotel,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';
import { OfflineBookingForm } from '@/features/admin/OfflineBookingForm';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAdminLogs } from '@/hooks/useAdminLogs';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminDashboard() {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const { data: statsData, isLoading, error } = useAdminStats();
    const { data: logs, isLoading: logsLoading } = useAdminLogs();

    if (error) {
        // ...
    }

    const stats = [
        {
            label: "Today's Bookings",
            value: statsData?.todayBookings ?? '0',
            change: "+8%", // Placeholder for trend logic if backend provides it
            trend: "up",
            icon: Calendar
        },
        {
            label: "Total Check-ins",
            value: statsData?.upcomingCheckinsCount ?? '0',
            change: "Weekly Total",
            trend: "neutral",
            icon: Users
        },
        {
            label: "Monthly Revenue",
            value: `$${(statsData?.revenue ?? 0).toLocaleString()}`,
            change: "+12%",
            trend: "up",
            icon: DollarSign
        },
        {
            label: "Recent Activity",
            value: logs?.[0]?.action || "Monitoring",
            change: logs?.length ? `${logs.length} events` : "Normal",
            trend: "neutral",
            icon: AlertTriangle
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Operations Overview</h2>
                    <p className="text-muted-foreground">Monitor your business performance and daily tasks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Search size={18} />
                        Search
                    </Button>
                    <Button className="gap-2" onClick={() => setIsBookingModalOpen(true)}>
                        + New Booking
                    </Button>
                </div>
            </div>

            {/* Modal Overlay */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <OfflineBookingForm
                        onClose={() => setIsBookingModalOpen(false)}
                        onSuccess={() => {
                            setIsBookingModalOpen(false);
                        }}
                    />
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
                ) : (
                    stats.map((stat) => (
                        <div key={stat.label} className="p-6 rounded-2xl bg-surface-light border border-surface-border shadow-sm group hover:border-primary/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <stat.icon size={20} />
                                </div>
                                <Badge variant={stat.trend === 'up' ? 'success' : stat.trend === 'down' ? 'destructive' : 'accent'}>
                                    {stat.change}
                                </Badge>
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings Table */}
                <div className="lg:col-span-2 rounded-2xl bg-surface-light border border-surface-border shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-surface-border flex items-center justify-between bg-surface-dark/10">
                        <h3 className="font-semibold text-lg">Recent Operations</h3>
                        <Button variant="ghost" size="sm">View All</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-dark/30 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-surface-border">
                                <tr>
                                    <th className="px-6 py-3 font-bold">Guest</th>
                                    <th className="px-6 py-3 font-bold">Service</th>
                                    <th className="px-6 py-3 font-bold">Date</th>
                                    <th className="px-6 py-3 font-bold">Status</th>
                                    <th className="px-6 py-3 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={5} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                                        </tr>
                                    ))
                                ) : statsData?.upcomingCheckins?.map((booking: any) => (
                                    <tr key={booking._id} className="hover:bg-surface-dark/20 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-sm text-white">{booking.user?.first_name} {booking.user?.last_name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{booking._id?.slice(-8)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-neutral-300">
                                            {booking.tour?.title || booking.lodge?.name || booking.car?.brand || 'Custom Service'}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                                            {format(new Date(booking.bookingDate || booking.createdAt), 'dd MMM yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                booking.status === 'confirmed' ? 'success' :
                                                    booking.status === 'pending' ? 'accent' : 'destructive'
                                            } className="capitalize py-0.5 px-2">
                                                {booking.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-right text-primary">
                                            ${booking.totalPrice}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Panel: Quick Stats & Insights */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-surface-light border border-surface-border shadow-sm">
                        <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Capacity Overview</h3>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase">
                                    <span className="text-neutral-500">Lodges</span>
                                    <span className="text-white">60%</span>
                                </div>
                                <div className="h-1.5 w-full bg-surface-dark rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-[60%] rounded-full shadow-glow-amber"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase">
                                    <span className="text-neutral-500">Tour Slots</span>
                                    <span className="text-white">85%</span>
                                </div>
                                <div className="h-1.5 w-full bg-surface-dark rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[85%] rounded-full shadow-glow-blue"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase">
                                    <span className="text-neutral-500">Fleet</span>
                                    <span className="text-white">40%</span>
                                </div>
                                <div className="h-1.5 w-full bg-surface-dark rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[40%] rounded-full shadow-glow-green"></div>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full mt-8 rounded-xl text-xs uppercase tracking-widest font-black h-12">
                            View Logistics
                        </Button>
                    </div>

                    <div className="p-8 rounded-2xl bg-primary text-black shadow-lg shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Globe size={120} />
                        </div>
                        <h3 className="font-black text-xs uppercase mb-3 tracking-widest text-black/60">Recent System Activity</h3>
                        <div className="space-y-3 relative z-10">
                            {logsLoading ? (
                                <Skeleton className="h-20 w-full" />
                            ) : logs?.slice(0, 3).map((log: any) => (
                                <div key={log._id} className="text-[11px] font-bold leading-tight flex justify-between gap-2 border-b border-black/10 pb-2 last:border-0">
                                    <span className="truncate">{log.action}: {log.details}</span>
                                    <span className="shrink-0 text-black/40">
                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: false })}
                                    </span>
                                </div>
                            ))}
                            {!logsLoading && (!logs || logs.length === 0) && (
                                <p className="text-xs font-bold opacity-60">System running smoothly. No recent events.</p>
                            )}
                        </div>
                        <Button className="bg-black text-white hover:bg-black/80 rounded-lg text-[10px] h-8 px-4 font-black uppercase mt-4">
                            View Full Log
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
