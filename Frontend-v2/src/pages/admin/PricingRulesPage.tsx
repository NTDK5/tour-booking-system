import { useState } from 'react';
import {
    Tag,
    Plus,
    Edit,
    Trash2,
    Calendar,
    Percent,
    DollarSign,
    TrendingUp,
    RefreshCw,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

const pricingRules = [
    { id: "PR-001", name: "Peak Season Hike", target: "All Lodges", effect: "+20%", period: "July - Sept", status: "active" },
    { id: "PR-002", name: "Early Bird Special", target: "Tours", effect: "-10%", period: "Always (60 days prior)", status: "active" },
    { id: "PR-003", name: "Group Discount (10+)", target: "Tours", effect: "-15%", period: "Always", status: "active" },
];

export default function PricingRulesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Pricing & Rules</h2>
                    <p className="text-muted-foreground">Define seasonal rates, discounts, and automated pricing overrides.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <RefreshCw size={18} />
                        Update All
                    </Button>
                    <Button className="gap-2">
                        <Plus size={18} />
                        New Rule
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {pricingRules.map((rule) => (
                        <div key={rule.id} className="bg-surface-light border border-surface-border rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-colors group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        {rule.effect.startsWith('+') ? <TrendingUp size={24} /> : <Tag size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold">{rule.name}</h3>
                                            <Badge variant="success" className="text-[10px]">{rule.status}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{rule.target}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit size={16} /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-error"><Trash2 size={16} /></Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Effect</p>
                                    <p className={`text-lg font-bold ${rule.effect.startsWith('+') ? 'text-amber-500' : 'text-success'}`}>
                                        {rule.effect}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Applicable Period</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar size={14} className="text-muted-foreground" />
                                        {rule.period}
                                    </div>
                                </div>
                                <div className="hidden md:block space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Last Modified</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Clock size={14} className="text-muted-foreground" />
                                        2 days ago
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="bg-surface-dark/30 border border-surface-border rounded-2xl p-6">
                        <h4 className="font-bold flex items-center gap-2 mb-4">
                            <Percent size={18} className="text-primary" />
                            Global Surcharge
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            A base service charge applied to all bookings. Current: <span className="text-foreground font-bold">5%</span>
                        </p>
                        <Input type="number" placeholder="Enter percentage..." className="mb-4" />
                        <Button className="w-full" size="sm">Update Surcharge</Button>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                        <h4 className="font-bold flex items-center gap-2 mb-2 text-primary">
                            <DollarSign size={18} />
                            Currency Rates
                        </h4>
                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                            USD is the base currency. ETH Birr rate is synced every 6 hours.
                        </p>
                        <div className="flex items-center justify-between text-sm py-2 border-b border-primary/10">
                            <span>1 USD</span>
                            <span className="font-bold">124.50 ETB</span>
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-xs">Manual Override</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
