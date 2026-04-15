import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Calendar, Users, DollarSign, MapPin } from 'lucide-react';
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
        formState: { errors, isSubmitting },
    } = useForm<OfflineBookingValues>({
        resolver: zodResolver(offlineBookingSchema),
        defaultValues: {
            numberOfPeople: 1,
            paymentStatus: 'unpaid',
            paymentMethod: 'cash',
        }
    });

    const bookingType = watch('bookingType');

    const onSubmit = async (data: OfflineBookingValues) => {
        try {
            await adminApi.createOfflineBooking(data);
            toast.success('Offline booking created successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create offline booking:', error);
            toast.error('Failed to create offline booking');
        }
    };

    return (
        <div className="bg-surface-light border border-surface-border rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-surface-border flex items-center justify-between bg-surface-dark/20">
                <div>
                    <h3 className="text-xl font-bold">New Offline Booking</h3>
                    <p className="text-sm text-muted-foreground">Manually record a booking from calls or walk-ins.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Guest Info */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">Guest Information</h4>
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

                    {/* Booking Basics */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">Service Selection</h4>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type of Booking</label>
                            <select
                                {...register('bookingType')}
                                    className="w-full h-11 px-4 rounded-xl bg-surface-dark border border-surface-border focus:ring-2 focus:ring-primary outline-none text-sm text-white"
                            >
                                <option value="Lodge">Lodge Stay</option>
                                <option value="Tour">Guided Tour</option>
                                <option value="Car">Car Rental</option>
                            </select>
                        </div>
                        <Input
                            label="Resource ID / Name"
                            placeholder="e.g. Standard Room, Guge Trek"
                            error={errors.resourceId?.message}
                            {...register('resourceId')}
                        />
                    </div>
                </div>

                <hr className="border-surface-border" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dates & People */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">Operational Details</h4>
                        {bookingType === 'Tour' ? (
                            <Input
                                label="Tour Date"
                                type="date"
                                error={errors.bookingDate?.message}
                                {...register('bookingDate')}
                            />
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
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
                    </div>

                    {/* Payment */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">Payment & Pricing</h4>
                        <Input
                            label="Total Price ($)"
                            type="number"
                            placeholder="0.00"
                            error={errors.totalPrice?.message}
                            {...register('totalPrice', { valueAsNumber: true })}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    {...register('paymentStatus')}
                                    className="w-full h-11 px-4 rounded-xl bg-surface-dark border border-surface-border outline-none text-sm text-white"
                                >
                                    <option value="unpaid">Unpaid</option>
                                    <option value="partial">Partial</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Method</label>
                                <select
                                    {...register('paymentMethod')}
                                    className="w-full h-11 px-4 rounded-xl bg-surface-dark border border-surface-border outline-none text-sm text-white"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank transfer">Bank Transfer</option>
                                    <option value="paypal">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-surface-border" />

                <div className="space-y-2">
                    <label className="text-sm font-medium">Internal Notes</label>
                    <textarea
                        {...register('internalNotes')}
                        className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border focus:ring-2 focus:ring-primary outline-none text-sm text-white placeholder:text-neutral-500 min-h-[100px]"
                        placeholder="Add any specific guest requests or internal operational notes here..."
                    />
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
