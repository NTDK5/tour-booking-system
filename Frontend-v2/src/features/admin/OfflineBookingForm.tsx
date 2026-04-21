import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AccessibleSelect } from '@/components/ui/AccessibleSelect';
import { X } from 'lucide-react';
import { adminApi } from '@/api/admin';
import toast from 'react-hot-toast';

const offlineBookingSchema = z.object({
    userName: z.string().min(2, 'Guest name is required'),
    userEmail: z.string().email('Invalid email address'),
    bookingType: z.enum(['Lodge', 'Tour', 'Car']),
    resourceId: z.string().min(1, 'Please select a resource'),
    numberOfPeople: z.number().min(1, 'At least 1 person required'),
    totalPrice: z.number().min(0, 'Invalid price'),
    paymentStatus: z.enum(['unpaid', 'partial', 'paid']),
    paymentMethod: z.enum(['cash', 'bank transfer', 'paypal']),
    checkInDate: z.string().optional(),
    checkOutDate: z.string().optional(),
    bookingDate: z.string().optional(),
    internalNotes: z.string().optional(),
    lifecycleStatus: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).default('confirmed'),
    departureId: z.string().optional(),
    selectedAddons: z.string().optional(),
    travelersJson: z.string().optional(),
    children: z.number().min(0).optional(),
});

type OfflineBookingValues = z.infer<typeof offlineBookingSchema>;

interface OfflineBookingFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function OfflineBookingForm({ onClose, onSuccess }: OfflineBookingFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<OfflineBookingValues>({
        resolver: zodResolver(offlineBookingSchema),
        defaultValues: {
            numberOfPeople: 1,
            paymentStatus: 'unpaid',
            paymentMethod: 'cash',
            lifecycleStatus: 'confirmed',
            children: 0,
        }
    });

    const bookingType = watch('bookingType');
    const paymentStatus = watch('paymentStatus');

    const onSubmit = async (data: OfflineBookingValues) => {
        try {
            const selectedAddons = data.selectedAddons
                ? data.selectedAddons.split(',').map((x) => x.trim()).filter(Boolean)
                : [];
            const travelers = data.travelersJson?.trim() ? JSON.parse(data.travelersJson) : undefined;
            await adminApi.createOfflineBooking({
                ...data,
                selectedAddons,
                travelers,
            });
            toast.success('Offline booking created successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create offline booking:', error);
            toast.error('Failed to create offline booking');
        }
    };

    return (
        <div className="bg-surface-light border border-surface-border rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-surface-border flex items-center justify-between bg-surface-dark/20">
                <div>
                    <h3 className="text-xl font-bold">New Offline Booking</h3>
                    <p className="text-sm text-muted-foreground">Record walk-in, phone, or assisted bookings with enterprise booking fields.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
                <div className="rounded-xl border border-surface-border bg-surface-dark/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Step 1 · Guest Profile
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            error={errors.userName?.message}
                            {...register('userName')}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            error={errors.userEmail?.message}
                            {...register('userEmail')}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface-dark/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Step 2 · Service Setup
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type of Booking</label>
                            <input type="hidden" {...register('bookingType')} />
                            <AccessibleSelect
                                value={watch('bookingType')}
                                onChange={(v) => setValue('bookingType', v as OfflineBookingValues['bookingType'], { shouldValidate: true })}
                                options={[
                                    { value: 'Lodge', label: 'Lodge Stay' },
                                    { value: 'Tour', label: 'Guided Tour' },
                                    { value: 'Car', label: 'Car Rental' },
                                ]}
                            />
                        </div>
                        <Input
                            label="Resource Reference"
                            placeholder="e.g. Standard Room, Guge Trek"
                            error={errors.resourceId?.message}
                            {...register('resourceId')}
                        />
                    </div>
                    {bookingType === 'Tour' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <Input label="Departure ID (optional)" placeholder="Mongo ID" {...register('departureId')} />
                            <Input label="Children Count" type="number" {...register('children', { valueAsNumber: true })} />
                            <Input label="Add-ons (comma separated)" placeholder="airport_transfer, meals_upgrade" {...register('selectedAddons')} />
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-surface-border bg-surface-dark/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Step 3 · Dates and Pricing
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="space-y-4">
                            {bookingType === 'Tour' ? (
                                <Input
                                    label="Tour Date"
                                    type="date"
                                    error={errors.bookingDate?.message}
                                    {...register('bookingDate')}
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Check-in"
                                        type="date"
                                        error={errors.checkInDate?.message}
                                        {...register('checkInDate')}
                                    />
                                    <Input
                                        label="Check-out"
                                        type="date"
                                        error={errors.checkOutDate?.message}
                                        {...register('checkOutDate')}
                                    />
                                </div>
                            )}
                            <Input
                                label="Number of People"
                                type="number"
                                error={errors.numberOfPeople?.message}
                                {...register('numberOfPeople', { valueAsNumber: true })}
                            />
                            <Input
                                label="Total Price ($)"
                                type="number"
                                placeholder="0.00"
                                error={errors.totalPrice?.message}
                                {...register('totalPrice', { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Payment Status</label>
                                    <input type="hidden" {...register('paymentStatus')} />
                                    <AccessibleSelect
                                        value={paymentStatus}
                                        onChange={(v) => setValue('paymentStatus', v as OfflineBookingValues['paymentStatus'], { shouldValidate: true })}
                                        options={[
                                            { value: 'unpaid', label: 'Unpaid' },
                                            { value: 'partial', label: 'Partial' },
                                            { value: 'paid', label: 'Paid' },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Payment Method</label>
                                    <input type="hidden" {...register('paymentMethod')} />
                                    <AccessibleSelect
                                        value={watch('paymentMethod')}
                                        onChange={(v) => setValue('paymentMethod', v as OfflineBookingValues['paymentMethod'], { shouldValidate: true })}
                                        options={[
                                            { value: 'cash', label: 'Cash' },
                                            { value: 'bank transfer', label: 'Bank Transfer' },
                                            { value: 'paypal', label: 'Other / Gateway' },
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Booking Lifecycle Status</label>
                                <input type="hidden" {...register('lifecycleStatus')} />
                                <AccessibleSelect
                                    value={watch('lifecycleStatus')}
                                    onChange={(v) => setValue('lifecycleStatus', v as OfflineBookingValues['lifecycleStatus'], { shouldValidate: true })}
                                    options={[
                                        { value: 'pending', label: 'Pending' },
                                        { value: 'confirmed', label: 'Confirmed' },
                                        { value: 'in_progress', label: 'In Progress' },
                                        { value: 'completed', label: 'Completed' },
                                        { value: 'cancelled', label: 'Cancelled' },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface-dark/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Step 4 · Internal Metadata
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Internal Notes</label>
                            <textarea
                                {...register('internalNotes')}
                                className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border focus:ring-2 focus:ring-primary outline-none text-sm text-white placeholder:text-neutral-500 min-h-[132px]"
                                placeholder="Operations notes, pickup constraints, preferences, and follow-up context..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Traveler Manifest JSON (optional)</label>
                            <textarea
                                {...register('travelersJson')}
                                className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border focus:ring-2 focus:ring-primary outline-none text-sm text-white placeholder:text-neutral-500 min-h-[132px] font-mono"
                                placeholder='[{"fullName":"John Doe","travelerType":"adult"}]'
                            />
                            <p className="text-xs text-muted-foreground">
                                Use JSON only if you already have traveler payload data.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                    <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Finalize Booking'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
