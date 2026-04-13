import React, { useState } from 'react';
import {
    Plus, Search, Edit, Trash2, Globe,
    Sparkles, MapPin, Info, CheckCircle2,
    Clock, DollarSign, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCustomTripOptions, useCustomTripRequests, useCreateTripOption } from '@/hooks/useCustomTrips';
import { useUpdateBooking } from '@/hooks/useAdminBookings';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function CustomTripManagementPage() {
    const [activeTab, setActiveTab] = useState<'options' | 'requests'>('requests');
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [proposedPrice, setProposedPrice] = useState('');

    const { data: options = [], isLoading: optionsLoading } = useCustomTripOptions();
    const { data: requests = [], isLoading: requestsLoading } = useCustomTripRequests();
    const updateBooking = useUpdateBooking();

    const handleProposePrice = async () => {
        if (!proposedPrice || isNaN(Number(proposedPrice))) {
            toast.error('Please enter a valid price');
            return;
        }

        // The request object has a 'booking' field which is the ID or populated booking
        const bookingId = typeof selectedRequest.booking === 'string'
            ? selectedRequest.booking
            : selectedRequest.booking?._id;

        if (!bookingId) {
            toast.error('No linked booking found for this request');
            return;
        }

        updateBooking.mutate({
            id: bookingId,
            payload: {
                status: 'offered',
                proposedPrice: Number(proposedPrice)
            }
        }, {
            onSuccess: () => {
                setSelectedRequest(null);
                setProposedPrice('');
            }
        });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight italic">Custom Trip <span className="text-primary italic-none">Operations</span></h2>
                    <p className="text-muted-foreground text-sm">Manage builders options and review incoming custom tour requests.</p>
                </div>
                {activeTab === 'options' && (
                    <Button className="gap-2 rounded-xl">
                        <Plus size={18} /> Add Option
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 p-1 bg-surface-light border border-surface-border rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-primary text-black shadow-glow' : 'text-neutral-500 hover:text-white'}`}
                >
                    User Requests
                </button>
                <button
                    onClick={() => setActiveTab('options')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'options' ? 'bg-primary text-black shadow-glow' : 'text-neutral-500 hover:text-white'}`}
                >
                    Builder Options
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'requests' ? (
                <div className="grid grid-cols-1 gap-6">
                    {requestsLoading ? (
                        [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-[32px]" />)
                    ) : requests.map((req: any) => (
                        <div key={req._id} className="group relative bg-surface-light border border-surface-border rounded-[32px] overflow-hidden hover:border-primary/50 transition-all p-8 flex flex-col lg:flex-row lg:items-center gap-8 shadow-xl">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Custom Request</div>
                                        <h3 className="text-xl font-bold text-white">{req.user?.first_name} {req.user?.last_name}</h3>
                                    </div>
                                    <Badge variant="accent" className="ml-auto lg:ml-0 capitalize">{(req as any).booking?.status || 'Submitted'}</Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 py-4 border-y border-surface-border">
                                    <div>
                                        <div className="text-[10px] uppercase text-neutral-600 font-bold tracking-tighter">Duration</div>
                                        <div className="text-white font-bold">{req.days} Days</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-neutral-600 font-bold tracking-tighter">Budget Range</div>
                                        <div className="text-white font-bold">${req.estimatedBudget || 'Not specified'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-neutral-600 font-bold tracking-tighter">Final Price</div>
                                        <div className="text-white font-bold">${req.finalPrice || req.booking?.proposedPrice || 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-neutral-600 font-bold tracking-tighter">Submitted</div>
                                        <div className="text-white font-bold">{format(new Date(req.createdAt), 'dd MMM yyyy')}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-neutral-600 font-bold tracking-tighter">ID</div>
                                        <div className="text-white font-mono text-xs">#{req._id.slice(-8).toUpperCase()}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-400 line-clamp-2 italic">"{req.notes || 'No additional notes provided'}"</p>
                            </div>

                            <div className="flex flex-col gap-3 min-w-[200px]">
                                {req.booking?.status === 'submitted' && (
                                    <Button
                                        variant="accent"
                                        className="w-full rounded-2xl font-bold italic"
                                        onClick={() => setSelectedRequest(req)}
                                    >
                                        Propose Price
                                    </Button>
                                )}
                                <Button variant="outline" className="w-full rounded-2xl">
                                    <Eye size={16} className="mr-2" /> View Details
                                </Button>
                            </div>
                        </div>
                    ))}
                    {!requestsLoading && requests.length === 0 && (
                        <div className="py-20 text-center space-y-4 border border-dashed border-surface-border rounded-[40px] bg-surface-light/30">
                            <Clock size={48} className="mx-auto text-neutral-600" />
                            <p className="text-neutral-500 font-medium">No custom tour requests yet.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {optionsLoading ? (
                        [...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-[32px]" />)
                    ) : options.map((opt: any) => (
                        <div key={opt._id} className="group bg-surface-light border border-surface-border rounded-[32px] p-6 space-y-4 hover:border-primary/50 transition-all shadow-lg hover:shadow-primary/5">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="uppercase tracking-widest text-[8px] px-3 border-primary/20 text-primary">{opt.type}</Badge>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-neutral-500 hover:text-white transition-colors bg-surface-dark rounded-xl border border-surface-border"><Edit size={14} /></button>
                                    <button className="p-2 text-neutral-500 hover:text-error transition-colors bg-surface-dark rounded-xl border border-surface-border"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white mb-2 leading-tight">{opt.name}</h3>
                                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 font-medium">{opt.description}</p>
                            </div>
                            <div className="pt-4 border-t border-surface-border/50 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Base Influence</span>
                                <span className="text-primary font-black text-lg">${opt.price || 0}</span>
                            </div>
                        </div>
                    ))}
                    <button className="group border-2 border-dashed border-surface-border rounded-[32px] flex flex-col items-center justify-center p-8 text-neutral-500 hover:border-primary/50 hover:text-primary transition-all gap-4 bg-surface-light/20">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-700 flex items-center justify-center group-hover:border-primary transition-colors">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold uppercase tracking-widest text-xs">Add New Option</span>
                    </button>
                </div>
            )}

            {/* Price Proposal Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-surface-light border border-surface-border rounded-3xl p-8 w-full max-w-md space-y-6 shadow-2xl">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <Sparkles size={20} />
                                <span className="text-[10px] uppercase font-black tracking-widest">Custom Tour Quote</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Price Proposal</h3>
                            <p className="text-sm text-neutral-400">Collaborate with {selectedRequest.user?.first_name} on their dream trip.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-surface-dark/50 border border-surface-border space-y-3 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-neutral-500 uppercase font-bold">Duration</span>
                                    <span className="text-white font-bold">{selectedRequest.days} Days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500 uppercase font-bold">User Budget</span>
                                    <span className="text-white font-bold">${selectedRequest.estimatedBudget}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-500 ml-1">Your Proposed Price (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                    <input
                                        type="number"
                                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-dark border border-surface-border focus:ring-2 focus:ring-primary outline-none text-xl font-black text-white"
                                        placeholder="0.00"
                                        value={proposedPrice}
                                        onChange={(e) => setProposedPrice(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl h-12"
                                onClick={() => setSelectedRequest(null)}
                            >
                                Not Now
                            </Button>
                            <Button
                                variant="accent"
                                className="flex-2 rounded-xl h-12 font-black italic shadow-glow"
                                onClick={handleProposePrice}
                                isLoading={updateBooking.isPending}
                            >
                                Send Proposal
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
