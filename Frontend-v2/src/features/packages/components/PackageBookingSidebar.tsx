import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Tour } from '@/types';

interface PackageBookingSidebarProps {
    tour: Tour;
}

export function PackageBookingSidebar({ tour }: PackageBookingSidebarProps) {
    return (
        <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
                <div className="card bg-surface-light p-8 border-primary/20 shadow-2xl">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-1">From Only</p>
                            <div className="flex items-center gap-2">
                                {tour.discountPrice && (
                                    <span className="text-xl text-neutral-600 line-through">${tour.price}</span>
                                )}
                                <span className="text-4xl font-extrabold text-white">${tour.discountPrice || tour.price}</span>
                            </div>
                        </div>
                        <Badge variant="accent">Best Price</Badge>
                    </div>

                    <Link to={`/booking/${tour._id}?type=tour`}>
                        <Button size="lg" className="w-full h-14 text-lg">
                            Book This Adventure
                            <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>

                    <div className="mt-8 pt-8 border-t border-surface-border space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-500">Duration</span>
                            <span className="text-white font-bold">{tour.duration} Days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-500">Group Size</span>
                            <span className="text-white font-bold">Up to {tour.groupSize}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-500">Cancellation</span>
                            <span className="text-success font-bold">Free up to 72h</span>
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
