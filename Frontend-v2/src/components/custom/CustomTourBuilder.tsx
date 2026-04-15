import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronLeft,
    Sparkles, CheckCircle2, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCustomTripDestinations, useSubmitCustomTrip } from '@/hooks/useCustomTrips';
import { Badge } from '@/components/ui/Badge';
import { customTripsApi } from '@/api/customTrips';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CustomStep {
    id: number;
    title: string;
    description: string;
}

const STEPS: CustomStep[] = [
    { id: 1, title: "Duration", description: "How many days is your dream trip?" },
    { id: 2, title: "Itinerary", description: "Select destinations and activities for each day." },
    { id: 3, title: "Review", description: "Almost there! Review and submit your request." }
];

export default function CustomTourBuilder({ onClose }: { onClose: () => void }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [days, setDays] = useState(3);
    const [itinerary, setItinerary] = useState<any[]>([
        { day: 1, destinationId: '', itineraryItemId: '', notes: '' },
        { day: 2, destinationId: '', itineraryItemId: '', notes: '' },
        { day: 3, destinationId: '', itineraryItemId: '', notes: '' }
    ]);
    const [notes, setNotes] = useState('');
    const [mode, setMode] = useState<'budget' | 'premium'>('budget');
    const [templateName, setTemplateName] = useState('');

    const [itineraryOptionsByDestination, setItineraryOptionsByDestination] = useState<Record<string, any[]>>({});
    const { data: destinations = [] } = useCustomTripDestinations();
    const { mutate: submitRequest, isPending } = useSubmitCustomTrip();

    const basePerDay = mode === 'budget' ? 90 : 160;
    const modeMultiplier = mode === 'budget' ? 0.95 : 1.2;

    const selectedItineraryOptions = useMemo(() => {
        const selectedIds = itinerary.map((day) => day.itineraryItemId).filter(Boolean);
        return selectedIds.map((id) => {
            for (const day of itinerary) {
                if (day.itineraryItemId === id && Array.isArray((day as any)._options)) {
                    return (day as any)._options.find((opt: any) => opt._id === id);
                }
            }
            return null;
        }).filter(Boolean);
    }, [itinerary]);

    const destinationCost = itinerary.reduce((sum: number, day: any) => {
        const destination = destinations.find((d: any) => d._id === day.destinationId);
        if (!destination) return sum;
        return sum + (destination.basePricePerDay || 0) + (destination.transportSurcharge || 0);
    }, 0);

    const optionsCost = selectedItineraryOptions.reduce((sum: number, item: any) => sum + (item?.price || 0), 0);

    const daysCost = days * basePerDay;
    const subtotal = daysCost + destinationCost + optionsCost;
    const finalTotal = Math.round(subtotal * modeMultiplier);
    const estimatedMin = Math.round(finalTotal * 0.9);
    const estimatedMax = Math.round(finalTotal * 1.12);

    const priceChangeReasons = [
        `Base day rate (${days} x $${basePerDay})`,
        `Destination and transfer costs (+$${destinationCost})`,
        `Selected daily itinerary activities (+$${optionsCost})`,
        `${mode === 'budget' ? 'Budget-friendly' : 'Premium-comfort'} mode multiplier`
    ];

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(prev => prev + 1);
        else {
            if (!isAuthenticated) {
                toast.error('Please sign in to submit a custom trip request.');
                onClose();
                navigate('/auth/login');
                return;
            }
            submitRequest({
                days,
                itinerary,
                notes,
                mode,
                templateName: templateName || undefined,
                estimatedBudget: finalTotal,
                finalPrice: finalTotal,
                pricingBreakdown: {
                    basePerDay,
                    daysCost,
                    optionsCost: optionsCost + destinationCost,
                    modeMultiplier,
                    subtotal,
                    finalTotal
                },
                priceChangeReasons,
                estimateSnapshot: {
                    estimatedBudget: finalTotal,
                    finalPrice: finalTotal,
                    pricingBreakdown: {
                        basePerDay,
                        daysCost,
                        optionsCost: optionsCost + destinationCost,
                        modeMultiplier,
                        subtotal,
                        finalTotal
                    },
                    priceChangeReasons
                },
            }, {
                onSuccess: () => onClose()
            });
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const setDayDestination = async (dayIndex: number, destinationId: string) => {
        const newItinerary = [...itinerary];
        newItinerary[dayIndex] = {
            ...newItinerary[dayIndex],
            destinationId,
            itineraryItemId: '',
            _options: []
        };
        setItinerary(newItinerary);
        if (destinationId && !itineraryOptionsByDestination[destinationId]) {
            try {
                const items = await customTripsApi.getItinerariesByDestination(destinationId);
                setItineraryOptionsByDestination((prev) => ({ ...prev, [destinationId]: items || [] }));
            } catch {
                setItineraryOptionsByDestination((prev) => ({ ...prev, [destinationId]: [] }));
            }
        }
    };

    const setDayItineraryOption = (dayIndex: number, option: any) => {
        const newItinerary = [...itinerary];
        const destinationId = newItinerary[dayIndex].destinationId;
        newItinerary[dayIndex] = {
            ...newItinerary[dayIndex],
            itineraryItemId: option._id,
            _options: itineraryOptionsByDestination[destinationId] || []
        };
        setItinerary(newItinerary);
    };

    const applyTemplate = (template: 'Classic North' | 'Southern Culture' | 'Adventure Mix') => {
        setTemplateName(template);
        const destinationIds = destinations.map((d: any) => d._id);

        const generated = Array.from({ length: days }, (_, i) => ({
            day: i + 1,
            destinationId: destinationIds[i % Math.max(destinationIds.length, 1)] || '',
            itineraryItemId: '',
            notes: `${template} - Day ${i + 1}`
        }));
        setItinerary(generated);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-surface/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
            <div className="w-full max-w-5xl bg-surface-light rounded-[40px] border border-surface-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-surface-border flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h2 className="text-2xl font-bold text-white italic">Premium <span className="text-primary italic-none">Custom Trip</span></h2>
                        </div>
                        <p className="text-neutral-500 text-sm">Design your unique Ethiopian experience</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-full border border-surface-border flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-8 py-4 bg-surface border-b border-surface-border">
                    <div className="flex justify-between items-center max-w-2xl mx-auto">
                        {STEPS.map((step, i) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= step.id ? 'border-primary bg-primary/10 text-primary' : 'border-surface-border text-neutral-600'
                                        }`}>
                                        {currentStep > step.id ? <CheckCircle2 className="w-6 h-6" /> : step.id}
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold tracking-widest ${currentStep >= step.id ? 'text-white' : 'text-neutral-600'}`}>{step.title}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-[2px] mx-4 transition-all ${currentStep > step.id ? 'bg-primary' : 'bg-surface-border'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-surface/50">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-xl mx-auto space-y-12 py-12"
                            >
                                <div className="text-center space-y-4">
                                    <div className="text-6xl font-black text-primary italic mb-6">{days} Days</div>
                                    <input
                                        type="range" min="1" max="14" step="1"
                                        value={days} onChange={(e) => {
                                            const d = Number(e.target.value);
                                            setDays(d);
                                            setItinerary(Array.from({ length: d }, (_, i) => ({ day: i + 1, destinationId: '', itineraryItemId: '', notes: '' })));
                                        }}
                                        className="w-full accent-primary h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <p className="text-neutral-400">Duration affects the number of destinations you can visit comfortably.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-center text-xs uppercase font-bold tracking-widest text-neutral-500">Travel Mode</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setMode('budget')}
                                            className={`p-4 rounded-2xl border text-sm font-bold ${mode === 'budget' ? 'border-primary bg-primary/10 text-white' : 'border-surface-border text-neutral-400'}`}
                                        >
                                            Budget Friendly
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode('premium')}
                                            className={`p-4 rounded-2xl border text-sm font-bold ${mode === 'premium' ? 'border-primary bg-primary/10 text-white' : 'border-surface-border text-neutral-400'}`}
                                        >
                                            Premium
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-surface border border-surface-border">
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-2">Live Budget Estimate</div>
                                    <div className="text-white font-black text-2xl">${estimatedMin} - ${estimatedMax}</div>
                                    <p className="text-xs text-neutral-500 mt-2">Estimate gets more precise as you select destinations and activities.</p>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12 pb-12"
                            >
                                <div className="p-5 rounded-2xl bg-surface border border-surface-border">
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-3">Need help starting?</div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Classic North', 'Southern Culture', 'Adventure Mix'].map((template) => (
                                            <button
                                                key={template}
                                                type="button"
                                                onClick={() => applyTemplate(template as any)}
                                                className={`px-3 py-2 rounded-xl border text-xs font-bold ${templateName === template ? 'border-primary text-white bg-primary/10' : 'border-surface-border text-neutral-400'}`}
                                            >
                                                {template}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {itinerary.map((day, dIdx) => (
                                    <div key={dIdx} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic">Day {day.day}</div>
                                            <div className="h-[1px] flex-1 bg-surface-border"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <select
                                                value={day.destinationId}
                                                onChange={(e) => setDayDestination(dIdx, e.target.value)}
                                                className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                                            >
                                                <option value="">Select destination for Day {day.day}</option>
                                                {destinations.map((destination: any) => (
                                                    <option key={destination._id} value={destination._id}>
                                                        {destination.name} (${destination.basePricePerDay}/day)
                                                    </option>
                                                ))}
                                            </select>

                                            {day.destinationId && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {(itineraryOptionsByDestination[day.destinationId] || []).map((opt: any) => (
                                                        <div
                                                            key={opt._id}
                                                            onClick={() => setDayItineraryOption(dIdx, opt)}
                                                            className={`p-4 rounded-[24px] border transition-all cursor-pointer group ${day.itineraryItemId === opt._id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-surface-border bg-surface hover:border-primary/30'}`}
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <Badge variant="outline" className="uppercase tracking-widest text-[8px]">{opt.dayType}</Badge>
                                                                {day.itineraryItemId === opt._id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                                            </div>
                                                            <h4 className="text-white font-bold mb-1">{opt.title}</h4>
                                                            <p className="text-[10px] text-neutral-500 line-clamp-2">{opt.summary}</p>
                                                            <p className="text-xs text-primary mt-3 font-bold">${opt.price}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl mx-auto space-y-8 py-8"
                            >
                                <div className="p-8 rounded-[32px] bg-surface border border-surface-border space-y-6">
                                    <h3 className="text-xl font-bold text-white italic">Inquiry <span className="text-primary italic-none tracking-widest">Details</span></h3>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <div className="text-[10px] uppercase font-bold text-neutral-600 tracking-widest">Duration</div>
                                            <div className="text-white font-bold">{days} Days</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[10px] uppercase font-bold text-neutral-600 tracking-widest">Travel Mode</div>
                                            <div className="text-white font-bold capitalize">{mode}</div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-surface-light border border-surface-border p-4 space-y-2">
                                        <div className="flex justify-between text-sm"><span className="text-neutral-500">Base days cost</span><span className="text-white">${daysCost}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-neutral-500">Destinations & transfers</span><span className="text-white">${destinationCost}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-neutral-500">Selected itineraries</span><span className="text-white">${optionsCost}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-neutral-500">Mode multiplier</span><span className="text-white">x{modeMultiplier}</span></div>
                                        <div className="flex justify-between text-lg font-black border-t border-surface-border pt-2"><span className="text-white">Final price</span><span className="text-primary">${finalTotal}</span></div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-[10px] uppercase font-bold text-neutral-600 tracking-widest">Why price changed</div>
                                        {priceChangeReasons.map((reason) => (
                                            <p key={reason} className="text-xs text-neutral-400">- {reason}</p>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-[10px] uppercase font-bold text-neutral-600 tracking-widest">Additional Notes</div>
                                        <textarea
                                            value={notes} onChange={(e) => setNotes(e.target.value)}
                                            className="w-full bg-surface-light border border-surface-border rounded-xl p-4 text-sm text-white outline-none focus:border-primary resize-none h-32"
                                            placeholder="Tell us about special requests, dietary needs, or preferences..."
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-surface-border flex justify-between bg-surface-light">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentStep === 1}
                        className="rounded-2xl"
                    >
                        <ChevronLeft className="mr-2 w-4 h-4" />
                        Previous
                    </Button>
                    <Button
                        variant="accent"
                        onClick={handleNext}
                        isLoading={isPending}
                        className="px-8 rounded-2xl font-bold"
                    >
                        {currentStep === 3 ? 'Submit Request' : 'Continue'}
                        <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
