import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, CreditCard,
    Calendar, Users, Info, ShieldCheck,
    MapPin, Home, Car as CarIcon, Map
} from 'lucide-react';
import { useTour } from '@/hooks/useTours';
import { useLodge } from '@/hooks/useLodges';
import { useCreateBooking } from '@/hooks/useBookings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { BookingSummaryCard } from '@/components/ui/BookingSummaryCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { format } from 'date-fns';

const travelerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(5, 'Phone number is required'),
    nationality: z.string().min(2, 'Nationality is required'),
    specialRequests: z.string().optional(),
});

type TravelerData = z.infer<typeof travelerSchema>;

const STEPS = ['Selection', 'Travelers', 'Review', 'Payment'];

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
    const [bookingData, setBookingData] = useState({
        startDate: checkInParam || '',
        endDate: checkOutParam || '',
        guests: 1,
        roomType: roomTypeParam || '',
    });

    // Fetch based on type
    const { data: tour, isLoading: isTourLoading } = useTour(bookingType === 'tour' ? tourId! : '');
    const { data: lodge, isLoading: isLodgeLoading } = useLodge(bookingType === 'lodge' ? tourId! : '');

    const createBookingMutation = useCreateBooking();
    const [travelerInfo, setTravelerInfo] = useState<TravelerData | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<TravelerData>({
        resolver: zodResolver(travelerSchema),
    });

    const isLoading = isTourLoading || isLodgeLoading;
    const entity = bookingType === 'tour' ? tour : lodge;

    if (isLoading) return <div className="p-20"><Skeleton className="h-96" /></div>;
    if (!entity && !isLoading) return <ErrorState />;

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const onTravelerSubmit = (data: TravelerData) => {
        setTravelerInfo(data);
        nextStep();
    };

    const handleFinalConfirm = async () => {
        if (!travelerInfo || !user) return;

        const payload: any = {
            bookingType,
            numberOfPeople: bookingData.guests,
            paymentMethod: 'paypal',
            notes: travelerInfo.specialRequests,
            totalPrice: getPrice(),
        };

        if (bookingType === 'tour') {
            payload.tourId = tourId;
            payload.bookingDate = bookingData.startDate;
        } else if (bookingType === 'lodge') {
            payload.lodgeId = tourId;
            payload.checkInDate = bookingData.startDate;
            payload.checkOutDate = bookingData.endDate;
            payload.roomType = bookingData.roomType;
        }

        try {
            await createBookingMutation.mutateAsync(payload);
            navigate('/dashboard/bookings');
        } catch (error) {
            // Handled by mutation hook
        }
    };

    const getPrice = () => {
        if (bookingType === 'tour' && tour) return tour.price * bookingData.guests;
        if (bookingType === 'lodge' && lodge) {
            const room = lodge.roomTypes.find((r: any) => r.type === bookingData.roomType) || lodge.roomTypes[0];
            return room.price;
        }
        return 0;
    };

    return (
        <div className="min-h-screen bg-surface py-12 md:py-20">
            <div className="section-container">
                <header className="mb-12 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4 italic">Complete Your <span className="text-primary tracking-widest">{bookingType === 'tour' ? 'Adventure' : 'Stay'}</span></h1>
                    <ProgressStepper steps={STEPS} currentStep={step} />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <main className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="card bg-surface-light p-8 border-surface-border">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            {bookingType === 'tour' ? 'Date & Guests' : 'Lodge Preferences'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label={bookingType === 'tour' ? "Start Date" : "Check-in Date"}
                                                type="date"
                                                value={bookingData.startDate}
                                                onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                                            />
                                            {bookingType === 'lodge' && (
                                                <Input
                                                    label="Check-out Date"
                                                    type="date"
                                                    value={bookingData.endDate}
                                                    onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                                                />
                                            )}
                                            <Input
                                                label="Number of Guests"
                                                type="number"
                                                min={1}
                                                value={bookingData.guests}
                                                onChange={(e) => setBookingData({ ...bookingData, guests: Number(e.target.value) })}
                                            />
                                            {bookingType === 'lodge' && lodge && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-neutral-500 uppercase px-2">Room Type</label>
                                                    <select
                                                        className="w-full h-14 bg-surface border border-surface-border rounded-2xl px-4 text-white outline-none focus:border-primary transition-all"
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
                                        </div>
                                    </div>
                                    <Button onClick={nextStep} className="w-full md:w-auto px-12 h-14" disabled={!bookingData.startDate || (bookingType === 'lodge' && !bookingData.endDate)}>
                                        Continue to Details
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <form onSubmit={handleSubmit(onTravelerSubmit)} className="space-y-8">
                                        <div className="card bg-surface-light p-8 border-surface-border space-y-6">
                                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Traveler Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
                                                <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
                                            </div>
                                            <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message} />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input label="Phone Number" {...register('phone')} error={errors.phone?.message} />
                                                <Input label="Nationality" {...register('nationality')} error={errors.nationality?.message} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-500 uppercase">Special Requests</label>
                                                <textarea {...register('specialRequests')} className="w-full bg-surface border border-surface-border rounded-2xl p-4 text-white outline-none focus:border-primary min-h-[100px]" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Button variant="secondary" onClick={prevStep} className="h-14 px-8">Back</Button>
                                            <Button type="submit" className="h-14 px-12 flex-grow md:flex-none">Review</Button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="card bg-surface-light p-8 border-surface-border">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Info className="w-5 h-5 text-primary" />Final Review</h3>
                                        <div className="grid grid-cols-2 gap-8 text-sm">
                                            <div><span className="text-neutral-500 block">Traveler</span><span className="text-white font-bold">{travelerInfo?.firstName} {travelerInfo?.lastName}</span></div>
                                            <div><span className="text-neutral-500 block">Reservaton</span><span className="text-white font-bold">{(entity as any)?.title || (entity as any)?.name}</span></div>
                                            <div><span className="text-neutral-500 block">Type</span><span className="text-primary font-black uppercase tracking-widest">{bookingType}</span></div>
                                            <div><span className="text-neutral-500 block">Dates</span><span className="text-white font-bold">{bookingData.startDate} {bookingData.endDate ? `to ${bookingData.endDate}` : ''}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="secondary" onClick={prevStep} className="h-14 px-8">Back</Button>
                                        <Button onClick={nextStep} className="h-14 px-12 flex-grow md:flex-none">Proceed to Payment</Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="card bg-surface-light p-8 border-primary/20 bg-primary/5">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />Payment Method</h3>
                                        <div className="p-10 border-2 border-dashed border-surface-border rounded-3xl flex flex-col items-center text-center">
                                            <ShieldCheck className="w-12 h-12 text-primary mb-4" />
                                            <h4 className="text-white font-bold mb-2">PayPal Checkout</h4>
                                            <p className="text-xs text-neutral-500">Secure, encrypted, and fast.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="secondary" onClick={prevStep} className="h-14 px-8">Back</Button>
                                        <Button onClick={handleFinalConfirm} isLoading={createBookingMutation.isPending} className="h-14 px-12 flex-grow md:flex-none">Complete Booking</Button>
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
                            totalPrice={getPrice()}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}
