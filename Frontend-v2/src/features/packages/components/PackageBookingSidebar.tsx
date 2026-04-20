import { Link } from 'react-router-dom';
import { ChevronRight, Clock3, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Tour } from '@/types';

interface PackageBookingSidebarProps {
    tour: Tour;
}

export function PackageBookingSidebar({ tour }: PackageBookingSidebarProps) {
    const durationDays = Number(tour.durationDetails?.days ?? tour.duration ?? 0);
    const displayPrice = Number(tour.basePrice || tour.price || 0);
    const maxGuests = Number(tour.maxGuests || tour.groupSize || 0);

    return (
        <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
                <div className="card bg-surface-light p-8 border-primary/20 shadow-2xl rounded-3xl">
                    <div className="flex items-end justify-between mb-8 gap-4">
                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-1">Starting From</p>
                            <div className="flex items-center gap-2">
                                {tour.discountPrice && (
                                    <span className="text-xl text-neutral-600 line-through">${tour.price}</span>
                                )}
                                <span className="text-4xl font-extrabold text-white">${tour.discountPrice || displayPrice}</span>
                            </div>
                            <p className="text-sm text-neutral-400 mt-1">per guest (final quote at checkout)</p>
                        </div>
                        <Badge variant="accent">Best Price</Badge>
                    </div>

                    <Link to={`/booking/${tour._id}?type=tour`}>
                        <Button size="lg" className="w-full h-14 text-lg">
                            Book This Adventure
                            <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>

                    <div className="mt-8 pt-8 border-t border-surface-border space-y-3">
                        <div className="flex items-center justify-between text-sm bg-surface-dark/40 rounded-xl px-3 py-2">
                            <span className="text-neutral-400 inline-flex items-center gap-2"><Clock3 size={14} /> Duration</span>
                            <span className="text-white font-bold">{durationDays} Days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm bg-surface-dark/40 rounded-xl px-3 py-2">
                            <span className="text-neutral-400 inline-flex items-center gap-2"><Users size={14} /> Group Size</span>
                            <span className="text-white font-bold">
                                {tour.minGuests ? `${tour.minGuests}-${maxGuests}` : `Up to ${maxGuests}`}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm bg-surface-dark/40 rounded-xl px-3 py-2">
                            <span className="text-neutral-400 inline-flex items-center gap-2"><Wallet size={14} /> Deposit</span>
                            <span className="text-success font-bold">{tour.depositPercent ?? 20}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm bg-surface-dark/40 rounded-xl px-3 py-2">
                            <span className="text-neutral-400">Booking Cutoff</span>
                            <span className="text-white font-bold">{tour.bookingCutoffHours ?? 24}h</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-light/50 p-4 rounded-2xl border border-surface-border text-center">
                        <Badge variant="accent" className="mb-2">
                            Verified
                        </Badge>
                        <p className="text-[10px] text-neutral-500">Dorze Certified</p>
                    </div>
                    <div className="bg-surface-light/50 p-4 rounded-2xl border border-surface-border text-center">
                        <Badge variant="secondary" className="mb-2">
                            Support
                        </Badge>
                        <p className="text-[10px] text-neutral-500">24/7 Assistance</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
