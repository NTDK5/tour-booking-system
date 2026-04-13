import { Calendar, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BookingSummaryCardProps {
    tourTitle: string;
    startDate: string;
    guests: number;
    totalPrice: number;
    onConfirm?: () => void;
    isLoading?: boolean;
}

export function BookingSummaryCard({
    tourTitle,
    startDate,
    guests,
    totalPrice,
    onConfirm,
    isLoading,
}: BookingSummaryCardProps) {
    return (
        <div className="card bg-surface-light border-primary/20 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6">Booking Summary</h3>

            <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="text-neutral-300 font-medium">{tourTitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-neutral-500 shrink-0" />
                    <p className="text-sm text-neutral-400">Starts on {startDate}</p>
                </div>

                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-neutral-500 shrink-0" />
                    <p className="text-sm text-neutral-400">{guests} {guests === 1 ? 'Guest' : 'Guests'}</p>
                </div>
            </div>

            <div className="pt-6 border-t border-surface-border space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Total Price</span>
                    <span className="text-2xl font-bold text-white">${totalPrice}</span>
                </div>

                <p className="text-[10px] text-neutral-500 leading-relaxed text-center">
                    By clicking confirm, you agree to our terms of service and cancellation policy.
                </p>

                {onConfirm && (
                    <Button
                        className="w-full h-12"
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        Confirm & Pay
                    </Button>
                )}
            </div>
        </div>
    );
}
