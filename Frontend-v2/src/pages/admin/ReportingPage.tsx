import { useState } from 'react';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Download,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Users,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ReportingPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Business Analytics</h2>
                    <p className="text-muted-foreground">Detailed insights into revenue, occupancy, and tour performance.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Calendar size={18} />
                        Last 30 Days
                    </Button>
                    <Button className="gap-2">
                        <Download size={18} />
                        Full Report (PDF)
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-surface-light border border-surface-border rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground font-medium">Total Revenue</span>
                        <Badge variant="success" className="gap-1"><ArrowUpRight size={12} /> 14%</Badge>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">$12,450.00</p>
                    <p className="text-xs text-muted-foreground mt-2">vs $10,920 last month</p>
                </div>
                <div className="p-6 bg-surface-light border border-surface-border rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground font-medium">Avg. Occupancy</span>
                        <Badge variant="success" className="gap-1"><ArrowUpRight size={12} /> 8%</Badge>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">72.4%</p>
                    <p className="text-xs text-muted-foreground mt-2">Highest: 94% (Guge Lodge)</p>
                </div>
                <div className="p-6 bg-surface-light border border-surface-border rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground font-medium">Guest Satisfaction</span>
                        <Badge variant="accent" className="gap-1">Stable</Badge>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">4.8 / 5</p>
                    <p className="text-xs text-muted-foreground mt-2">Based on 142 new reviews</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-surface-light border border-surface-border rounded-2xl h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary" />
                            Revenue Trend
                        </h3>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 text-xs">Daily</Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs bg-surface-dark">Weekly</Button>
                        </div>
                    </div>
                    <div className="flex-1 flex items-end gap-2 px-2">
                        {/* Mock Chart Visualization */}
                        {[40, 65, 45, 90, 85, 60, 75, 50, 80, 95, 70, 85].map((val, i) => (
                            <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm relative group" style={{ height: `${val}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ${(val * 12).toFixed(0)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-2">
                        <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                    </div>
                </div>

                <div className="p-6 bg-surface-light border border-surface-border rounded-2xl h-[400px] flex flex-col">
                    <h3 className="font-bold flex items-center gap-2 mb-6">
                        <PieChart size={18} className="text-amber-500" />
                        Service Distribution
                    </h3>
                    <div className="flex-1 flex flex-col justify-center gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">Tours & Treks</span>
                                <span className="font-bold">48%</span>
                            </div>
                            <div className="h-2 w-full bg-surface-dark rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[48%]"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">Lodge Bookings</span>
                                <span className="font-bold">35%</span>
                            </div>
                            <div className="h-2 w-full bg-surface-dark rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[35%]"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">Car Rentals</span>
                                <span className="font-bold">17%</span>
                            </div>
                            <div className="h-2 w-full bg-surface-dark rounded-full overflow-hidden">
                                <div className="h-full bg-success w-[17%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
