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
import { bookingsApi } from '@/api/bookings';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function CustomTripManagementPage() {
    const [activeTab, setActiveTab] = useState<'options' | 'requests'>('requests');
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [detailRequest, setDetailRequest] = useState<any>(null);
    const [proposedPrice, setProposedPrice] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

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
                status: 'offer_sent',
                proposedPrice: Number(proposedPrice),
                offer: {
                    finalPrice: Number(proposedPrice),
                    currency: 'USD',
                    adminNotes,
                    breakdown: [],
                },
                comment: adminNotes || 'Offer sent by admin',
            }
        }, {
            onSuccess: () => {
                setSelectedRequest(null);
                setProposedPrice('');
                setAdminNotes('');
            }
        });
    };

    const handleConfirmAccepted = async (bookingId: string) => {
        try {
            await bookingsApi.confirmRequest(bookingId, 'Reservation confirmed without payment.');
            toast.success('Request confirmed and reserved.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to confirm request.');
        }
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
                                {(req.booking?.status === 'submitted' || req.booking?.status === 'under_review') && (
                                    <Button
                                        variant="accent"
                                        className="w-full rounded-2xl font-bold italic"
                                        onClick={() => setSelectedRequest(req)}
                                    >
                                        Propose Price
                                    </Button>
                                )}
                                {(req.booking?.status === 'accepted' || req.booking?.status === 'confirmed') && (
                                    <Button
                                        variant="accent"
                                        className="w-full rounded-2xl font-bold"
                                        onClick={() => handleConfirmAccepted(req.booking?._id)}
                                    >
                                        Confirm Reservation
                                    </Button>
                                )}
                                <Button variant="outline" className="w-full rounded-2xl" onClick={() => setDetailRequest(req)}>
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
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-500 ml-1">Offer Notes / Changes</label>
                                <textarea
                                    className="w-full rounded-2xl bg-surface-dark border border-surface-border p-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary"
                                    rows={3}
                                    placeholder="Explain itinerary updates or pricing adjustments..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                />
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

            {detailRequest && (
                <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
                    <div className="bg-surface-light border border-surface-border rounded-3xl p-8 w-full max-w-4xl space-y-6 shadow-2xl max-h-[88vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Custom Trip Details</h3>
                                <p className="text-xs text-neutral-500 mt-1">#{detailRequest._id?.slice(-8).toUpperCase()}</p>
                            </div>
                            <Button variant="outline" onClick={() => setDetailRequest(null)}>Close</Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-surface border border-surface-border">
                                <p className="text-[10px] uppercase text-neutral-500 font-bold">Guest</p>
                                <p className="text-sm font-bold text-white mt-1">{detailRequest.user?.first_name} {detailRequest.user?.last_name}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-surface border border-surface-border">
                                <p className="text-[10px] uppercase text-neutral-500 font-bold">Duration</p>
                                <p className="text-sm font-bold text-white mt-1">{detailRequest.days} Days</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-surface border border-surface-border">
                                <p className="text-[10px] uppercase text-neutral-500 font-bold">Status</p>
                                <p className="text-sm font-bold text-white mt-1 uppercase">{detailRequest.booking?.status || 'submitted'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-surface border border-surface-border">
                                <p className="text-[10px] uppercase text-neutral-500 font-bold">Final Price</p>
                                <p className="text-sm font-bold text-primary mt-1">${detailRequest.finalPrice || detailRequest.booking?.proposedPrice || detailRequest.booking?.totalPrice || 0}</p>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-surface border border-surface-border">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Price Breakdown</h4>
                            {detailRequest.pricingBreakdown ? (
                                <div className="grid md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-between"><span className="text-neutral-500">Base per day</span><span className="text-white">${detailRequest.pricingBreakdown.basePerDay || 0}</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-500">Days cost</span><span className="text-white">${detailRequest.pricingBreakdown.daysCost || 0}</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-500">Options cost</span><span className="text-white">${detailRequest.pricingBreakdown.optionsCost || 0}</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-500">Mode multiplier</span><span className="text-white">x{detailRequest.pricingBreakdown.modeMultiplier || 1}</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span className="text-white">${detailRequest.pricingBreakdown.subtotal || 0}</span></div>
                                    <div className="flex justify-between font-bold"><span className="text-neutral-300">Final total</span><span className="text-primary">${detailRequest.pricingBreakdown.finalTotal || detailRequest.finalPrice || 0}</span></div>
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500">No pricing breakdown available.</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Itinerary Details</h4>
                            {(detailRequest.itinerary || []).length === 0 ? (
                                <p className="text-sm text-neutral-500">No itinerary details submitted.</p>
                            ) : (
                                (detailRequest.itinerary || []).map((day: any, idx: number) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-surface border border-surface-border space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-white">Day {day.day || idx + 1}</p>
                                            <Badge variant="outline">
                                                {day.destination?.name || day.destinationId || 'Destination not set'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-neutral-400">
                                            Itinerary: {day.itineraryItem?.title || day.itineraryItemId || 'No itinerary package selected'}
                                        </p>
                                        {day.itineraryItem?.price !== undefined && (
                                            <p className="text-sm text-primary font-bold">Itinerary Price: ${day.itineraryItem.price}</p>
                                        )}
                                        {(day.itineraryItem?.activities || []).length > 0 && (
                                            <div>
                                                <p className="text-xs uppercase text-neutral-500 font-bold mb-1">Activities</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {day.itineraryItem.activities.map((act: any, aIdx: number) => (
                                                        <Badge key={aIdx} variant="secondary">{act.title || 'Activity'}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {day.notes && <p className="text-xs text-neutral-500">Notes: {day.notes}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
