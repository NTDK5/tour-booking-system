import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calendar, CreditCard, Info, Users, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/providers/AuthProvider';
import { useTour } from '@/hooks/useTours';
import { useLodge } from '@/hooks/useLodges';
import { useCreateBooking, useBookingQuote, usePayBookingBalance, useTourBookingOptions } from '@/hooks/useBookings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { BookingSummaryCard } from '@/components/ui/BookingSummaryCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { clearBookingDraft, getBookingDraftKey, loadBookingDraft, saveBookingDraft } from '@/utils/bookingDraft';

const STEPS = ['Select Departure', 'Traveler Information', 'Review & Pricing', 'Payment', 'Confirmation'];

type TravelerRow = {
    fullName: string;
    travelerType: 'adult' | 'child' | 'infant';
    nationality?: string;
    passportNumber?: string;
};

const toDateInputValue = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export default function BookingPage() {
    const { user } = useAuth();
    const { tourId } = useParams<{ tourId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const bookingType = searchParams.get('type') || 'tour';
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const roomTypeParam = searchParams.get('room');

    const [step, setStep] = useState(1);
    const [children, setChildren] = useState(0);
    const [notes, setNotes] = useState('');
    const [selectedDepartureId, setSelectedDepartureId] = useState('');
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [bookingData, setBookingData] = useState({
        startDate: checkInParam || '',
        endDate: checkOutParam || '',
        guests: 1,
        roomType: roomTypeParam || '',
    });
    const [travelers, setTravelers] = useState<TravelerRow[]>([
        { fullName: '', travelerType: 'adult', nationality: '', passportNumber: '' },
    ]);

    const { data: tour, isLoading: isTourLoading } = useTour(bookingType === 'tour' ? tourId || '' : '');
    const { data: lodge, isLoading: isLodgeLoading } = useLodge(bookingType === 'lodge' ? tourId || '' : '');
    const {
        data: tourOptions,
        isLoading: isOptionsLoading,
    } = useTourBookingOptions(tourId || '', bookingType === 'tour');

    const createBookingMutation = useCreateBooking();
    const payBalanceMutation = usePayBookingBalance();
    const quoteMutation = useBookingQuote();

    const isLoading = isTourLoading || isLodgeLoading || (bookingType === 'tour' && isOptionsLoading);
    const entity = bookingType === 'tour' ? tour : lodge;

    const quote = quoteMutation.data?.quote;
    const canContinueSelection = bookingData.startDate && (bookingType !== 'lodge' || bookingData.endDate);
    const cutoffHours = Number(tourOptions?.bookingCutoffHours ?? 24);

    const earliestBookableDate = useMemo(() => {
        const date = new Date();
        date.setHours(date.getHours() + cutoffHours);
        return toDateInputValue(date);
    }, [cutoffHours]);

    const totalPrice = useMemo(() => {
        if (bookingType === 'tour') return quote?.total ?? 0;
        if (bookingType === 'lodge' && lodge) {
            const room = lodge.roomTypes.find((r: any) => r.type === bookingData.roomType) || lodge.roomTypes[0];
            return room?.price ?? 0;
        }
        return 0;
    }, [bookingType, quote?.total, lodge, bookingData.roomType]);
    const draftKey = useMemo(
        () => getBookingDraftKey(tourId || '', bookingType as 'tour' | 'lodge' | 'car', user?._id),
        [bookingType, tourId, user?._id]
    );

    useEffect(() => {
        const draft = loadBookingDraft(draftKey);
        if (!draft) return;
        setStep(Math.max(1, Math.min(5, Number(draft.currentStep || 1))));
        setBookingData((prev) => ({
            ...prev,
            startDate: draft.startDate || prev.startDate,
            endDate: draft.endDate || prev.endDate,
            guests: Math.max(1, Number(draft.guests || prev.guests || 1)),
        }));
        setChildren(Number(draft.children || 0));
        setSelectedDepartureId(draft.departureId || '');
        setSelectedAddons(Array.isArray(draft.selectedAddons) ? draft.selectedAddons : []);
        setTravelers(Array.isArray(draft.travelers) && draft.travelers.length ? draft.travelers : travelers);
        setNotes(draft.notes || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftKey]);

    useEffect(() => {
        if (!tourId) return;
        saveBookingDraft(draftKey, {
            packageId: tourId,
            departureId: selectedDepartureId || undefined,
            travelers,
            pricingSnapshot: quoteMutation.data?.pricingSnapshot || undefined,
            bookingType: bookingType as 'tour' | 'lodge' | 'car',
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            guests: bookingData.guests,
            children,
            selectedAddons,
            notes,
            currentStep: step,
            updatedAt: new Date().toISOString(),
        });
    }, [bookingData.endDate, bookingData.guests, bookingData.startDate, bookingType, children, draftKey, notes, quoteMutation.data?.pricingSnapshot, selectedAddons, selectedDepartureId, step, tourId, travelers]);

    const syncTravelerRows = (guestCount: number) => {
        setTravelers((prev) => {
            const next = [...prev];
            while (next.length < guestCount) {
                next.push({ fullName: '', travelerType: 'adult', nationality: '', passportNumber: '' });
            }
            return next.slice(0, guestCount);
        });
    };

    const recalcQuote = async () => {
        if (bookingType !== 'tour' || !tourId || !bookingData.startDate) return;
        try {
            const result = await quoteMutation.mutateAsync({
                bookingType: 'tour',
                tourId,
                numberOfPeople: bookingData.guests,
                children,
                bookingDate: bookingData.startDate,
                selectedAddons,
                departureId: selectedDepartureId || undefined,
            });
            return result;
        } catch {
            // handled by UI
            return null;
        }
    };

    const nextStep = async () => {
        if (step === 1 && bookingType === 'tour') {
            if (bookingData.startDate < earliestBookableDate) {
                toast.error(`Please select ${earliestBookableDate} or later due to booking cutoff.`);
                return;
            }
            const result = await recalcQuote();
            if (result && !result.available) {
                toast.error(result.reasons?.join('; ') || 'Tour not available for selected options');
                return;
            }
        }
        if (step === 2 && !isTravelerStepValid) {
            toast.error('Please complete all traveler names before continuing.');
            return;
        }
        setStep((s) => Math.min(s + 1, 5));
    };
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const isTravelerStepValid =
        travelers.length === bookingData.guests &&
        travelers.every((t) => t.fullName.trim().length > 1);

    const handleFinalConfirm = async () => {
        if (!user) return;
        if (!isTravelerStepValid) {
            toast.error('Please complete traveler names');
            setStep(2);
            return;
        }

        if (bookingType === 'tour' && !quoteMutation.data) {
            const result = await recalcQuote();
            if (result && !result.available) {
                toast.error(result.reasons?.join('; ') || 'Tour not available for selected options');
                return;
            }
        }

        const payload: any = {
            bookingType,
            numberOfPeople: bookingData.guests,
            paymentMethod: 'card',
            notes,
            totalPrice,
        };

        if (bookingType === 'tour') {
            payload.tourId = tourId;
            payload.bookingDate = bookingData.startDate;
            payload.children = children;
            payload.selectedAddons = selectedAddons;
            payload.departureId = selectedDepartureId || undefined;
            payload.travelers = travelers.map((t) => ({
                fullName: t.fullName.trim(),
                travelerType: t.travelerType,
                nationality: t.nationality || undefined,
                passportNumber: t.passportNumber || undefined,
            }));
        } else if (bookingType === 'lodge') {
            payload.lodgeId = tourId;
            payload.checkInDate = bookingData.startDate;
            payload.checkOutDate = bookingData.endDate;
            payload.roomType = bookingData.roomType;
        }

        try {
            const booking = await createBookingMutation.mutateAsync(payload);
            const balance = Number((booking as any)?.paymentSummary?.balanceDue ?? booking.totalPrice ?? totalPrice ?? 0);
            if (balance > 0) {
                const payRes = await payBalanceMutation.mutateAsync({ bookingId: booking._id, amount: balance });
                if (payRes?.clientSecret) {
                    setStep(5);
                    navigate(`/booking/${tourId}/payment-retry?bookingId=${booking._id}&clientSecret=${encodeURIComponent(payRes.clientSecret)}`);
                    return booking;
                }
            }
            clearBookingDraft(draftKey);
            setStep(5);
            navigate(`/booking/${tourId}/confirmation?bookingId=${booking._id}`);
            return booking;
        } catch {
            // handled by hook
            return null;
        }
    };

    if (isLoading) return <div className="p-20"><Skeleton className="h-96" /></div>;
    if (!entity && !isLoading) return <ErrorState onRetry={() => window.location.reload()} />;

    return (
        <div className="min-h-screen bg-surface py-12 md:py-20">
            <div className="section-container">
                <header className="mb-10 md:mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                        Complete Your <span className="text-primary">{bookingType === 'tour' ? 'Adventure' : 'Stay'}</span>
                    </h1>
                    <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto mb-6">
                        Enterprise booking flow: live pricing snapshot, traveler manifest, departure capacity checks, and ledger-ready payment state.
                    </p>
                    <ProgressStepper steps={STEPS} currentStep={step} />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <main className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="card bg-surface-light p-6 md:p-8 border-surface-border rounded-3xl space-y-6">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            {bookingType === 'tour' ? 'Date, Travelers, Add-ons' : 'Lodge Preferences'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <Input
                                                label={bookingType === 'tour' ? 'Travel Date' : 'Check-in Date'}
                                                type="date"
                                                min={bookingType === 'tour' ? earliestBookableDate : undefined}
                                                value={bookingData.startDate}
                                                onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                                                className="h-14 text-base md:text-lg"
                                            />
                                            {bookingType === 'lodge' && (
                                                <Input
                                                    label="Check-out Date"
                                                    type="date"
                                                    value={bookingData.endDate}
                                                    onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                                                    className="h-14 text-base md:text-lg"
                                                />
                                            )}
                                            <Input
                                                label="Total Guests"
                                                type="number"
                                                min={1}
                                                value={bookingData.guests}
                                                onChange={(e) => {
                                                    const guests = Math.max(1, Number(e.target.value) || 1);
                                                    setBookingData({ ...bookingData, guests });
                                                    setChildren((c) => Math.min(c, guests));
                                                    syncTravelerRows(guests);
                                                }}
                                                className="h-14 text-base md:text-lg"
                                            />
                                            {bookingType === 'tour' && (
                                                <Input
                                                    label="Children"
                                                    type="number"
                                                    min={0}
                                                    max={bookingData.guests}
                                                    value={children}
                                                    onChange={(e) => setChildren(Math.max(0, Math.min(bookingData.guests, Number(e.target.value) || 0)))}
                                                    className="h-14 text-base md:text-lg"
                                                />
                                            )}
                                            {bookingType === 'lodge' && lodge && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-neutral-500 uppercase px-2">Room Type</label>
                                                    <select
                                                        className="w-full h-14 bg-surface border border-surface-border rounded-xl px-4 text-base md:text-lg text-white outline-none focus:border-primary transition-all"
                                                        value={bookingData.roomType}
                                                        onChange={(e) => setBookingData({ ...bookingData, roomType: e.target.value })}
                                                    >
                                                        <option value="">Select a room</option>
                                                        {lodge.roomTypes.map((r: any) => (
                                                            <option key={r.type} value={r.type}>{r.type} (${r.price})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            {bookingType === 'tour' && (
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-xs font-bold text-neutral-500 uppercase px-2">Departure (optional)</label>
                                                    <select
                                                        className="w-full h-14 bg-surface border border-surface-border rounded-xl px-4 text-base md:text-lg text-white outline-none focus:border-primary transition-all"
                                                        value={selectedDepartureId}
                                                        onChange={(e) => setSelectedDepartureId(e.target.value)}
                                                    >
                                                        <option value="">Flexible / no fixed departure</option>
                                                        {(tourOptions?.departures || []).map((dep) => (
                                                            <option key={dep._id} value={dep._id} disabled={dep.seatsLeft <= 0}>
                                                                {new Date(dep.startsAt).toLocaleDateString()} · {dep.seatsLeft} seats left {dep.sku ? `· ${dep.sku}` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {bookingType === 'tour' && (
                                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 flex items-start gap-2">
                                                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                                <span>
                                                    Earliest valid booking date for this package is <strong>{earliestBookableDate}</strong>
                                                    {' '}based on the {cutoffHours}h booking cutoff.
                                                </span>
                                            </div>
                                        )}

                                        {bookingType === 'tour' && (tourOptions?.addons?.length || 0) > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold text-neutral-300 uppercase">Optional Add-ons</p>
                                                <div className="grid md:grid-cols-2 gap-3">
                                                    {tourOptions?.addons.map((addon) => {
                                                        const checked = selectedAddons.includes(addon.name);
                                                        return (
                                                            <label key={addon.name} className="flex items-center justify-between gap-3 bg-surface border border-surface-border rounded-xl px-4 py-3 text-base">
                                                                <span className="font-medium">{addon.name}</span>
                                                                <span className="text-neutral-300 font-semibold">${addon.price}</span>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    className="w-5 h-5"
                                                                    onChange={(e) => {
                                                                        const next = e.target.checked
                                                                            ? [...selectedAddons, addon.name]
                                                                            : selectedAddons.filter((x) => x !== addon.name);
                                                                        setSelectedAddons(next);
                                                                    }}
                                                                />
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {bookingType === 'tour' && (
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Button variant="outline" onClick={recalcQuote} isLoading={quoteMutation.isPending} className="h-12 text-base">
                                                    Recalculate Quote
                                                </Button>
                                                {quote && (
                                                    <p className="text-sm text-neutral-300">
                                                        Deposit: <strong>${quote.deposit.toFixed(2)}</strong> · Total: <strong>${quote.total.toFixed(2)}</strong>
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Button onClick={nextStep} className="w-full md:w-auto px-12 h-14 text-base md:text-lg" disabled={!canContinueSelection}>
                                        Continue to Travelers
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                    <div className="card bg-surface-light p-6 md:p-8 border-surface-border rounded-3xl space-y-4">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                                            <Users className="w-5 h-5 text-primary" />
                                            Traveler Manifest
                                        </h3>
                                        <p className="text-sm md:text-base text-neutral-300">
                                            Fill each traveler clearly for visas, rooming, and operations assignment.
                                        </p>
                                        {travelers.map((traveler, idx) => (
                                            <div key={idx} className="p-4 md:p-5 bg-surface rounded-2xl border border-surface-border space-y-4">
                                                <div className="text-xs md:text-sm font-semibold uppercase tracking-wide text-primary">
                                                    Traveler {idx + 1}
                                                </div>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <Input
                                                    label="Full name"
                                                    value={traveler.fullName}
                                                    onChange={(e) => {
                                                        const next = [...travelers];
                                                        next[idx] = { ...next[idx], fullName: e.target.value };
                                                        setTravelers(next);
                                                    }}
                                                    className="h-14 md:h-16 text-base md:text-lg"
                                                />
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-neutral-400 px-1">Type</label>
                                                    <select
                                                        className="w-full h-14 md:h-16 bg-surface-light border border-surface-border rounded-xl px-3 text-base md:text-lg text-white [&>option]:text-black [&>option]:bg-white"
                                                        value={traveler.travelerType}
                                                        onChange={(e) => {
                                                            const next = [...travelers];
                                                            next[idx] = {
                                                                ...next[idx],
                                                                travelerType: e.target.value as TravelerRow['travelerType'],
                                                            };
                                                            setTravelers(next);
                                                        }}
                                                    >
                                                        <option value="adult">Adult</option>
                                                        <option value="child">Child</option>
                                                        <option value="infant">Infant</option>
                                                    </select>
                                                </div>
                                                <Input
                                                    label="Nationality"
                                                    value={traveler.nationality || ''}
                                                    onChange={(e) => {
                                                        const next = [...travelers];
                                                        next[idx] = { ...next[idx], nationality: e.target.value };
                                                        setTravelers(next);
                                                    }}
                                                    className="h-14 md:h-16 text-base md:text-lg"
                                                />
                                                <Input
                                                    label="Passport (optional)"
                                                    value={traveler.passportNumber || ''}
                                                    onChange={(e) => {
                                                        const next = [...travelers];
                                                        next[idx] = { ...next[idx], passportNumber: e.target.value };
                                                        setTravelers(next);
                                                    }}
                                                    className="h-14 md:h-16 text-base md:text-lg"
                                                />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400 px-1">Special Requests</label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="w-full bg-surface border border-surface-border rounded-xl p-4 text-base md:text-lg text-white outline-none focus:border-primary min-h-[120px]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="secondary" onClick={prevStep} className="h-14 px-8 text-base">Back</Button>
                                        <Button onClick={nextStep} className="h-14 px-12 text-base md:text-lg" disabled={!isTravelerStepValid}>
                                            Review
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="card bg-surface-light p-6 md:p-8 border-surface-border rounded-3xl space-y-3">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-2">
                                            <Info className="w-5 h-5 text-primary" />
                                            Final Review
                                        </h3>
                                        <p className="text-base text-neutral-300">{travelers.length} travelers · {children} children</p>
                                        {selectedAddons.length > 0 && (
                                            <p className="text-sm text-neutral-400">Add-ons: {selectedAddons.join(', ')}</p>
                                        )}
                                        {selectedDepartureId && (
                                            <p className="text-sm text-neutral-400">Departure selected</p>
                                        )}
                                        {quote?.lines?.length ? (
                                            <ul className="text-base border border-surface-border rounded-xl p-4 space-y-2">
                                                {quote.lines.map((line, idx) => (
                                                    <li key={idx} className="flex justify-between">
                                                        <span>{line.label}</span>
                                                        <span>${Number(line.amount).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="secondary" onClick={prevStep} className="h-14 px-8 text-base">Back</Button>
                                        <Button onClick={nextStep} className="h-14 px-12 text-base md:text-lg">Proceed to Payment</Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="card bg-surface-light p-6 md:p-8 border-primary/20 bg-primary/5 rounded-3xl">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-primary" />
                                            Payment Overview
                                        </h3>
                                        <p className="text-base text-neutral-300">Payment is initiated immediately after booking creation and then redirected to secure retry/success pages.</p>
                                        {quote && (
                                            <div className="mt-4 grid md:grid-cols-2 gap-3 text-base">
                                                <p>Total: <span className="font-bold">${quote.total.toFixed(2)}</span></p>
                                                <p>Deposit due: <span className="font-bold">${quote.deposit.toFixed(2)}</span></p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="secondary" onClick={prevStep} className="h-14 px-8 text-base">Back</Button>
                                        <Button onClick={handleFinalConfirm} isLoading={createBookingMutation.isPending || payBalanceMutation.isPending} className="h-14 px-12 text-base md:text-lg">
                                            Proceed to Secure Payment
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 5 && (
                                <motion.div key="step5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="card bg-surface-light p-6 md:p-8 border-surface-border rounded-3xl space-y-4">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Redirecting to confirmation</h3>
                                        <p className="text-neutral-300">Your booking was captured. If this page remains, open your booking history and continue payment from the booking entry.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>

                    <aside className="lg:col-span-1">
                        <BookingSummaryCard
                            tourTitle={(entity as any)?.title || (entity as any)?.name || 'Reservation'}
                            startDate={bookingData.startDate || 'Not selected'}
                            guests={bookingData.guests}
                            totalPrice={totalPrice}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}
