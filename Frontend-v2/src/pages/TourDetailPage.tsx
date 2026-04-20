import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTour } from '@/hooks/useTours';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { PackageHero, getPackageHeroImage } from '@/features/packages/components/PackageHero';
import { PackageOverview } from '@/features/packages/components/PackageOverview';
import { PackageInclusions } from '@/features/packages/components/PackageInclusions';
import { PackageItinerary } from '@/features/packages/components/PackageItinerary';
import { PackageBookingSidebar } from '@/features/packages/components/PackageBookingSidebar';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Users, Wallet, Clock3, MapPin } from 'lucide-react';

export default function TourDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: tour, isLoading, isError, refetch } = useTour(id!);

    if (isLoading) return <TourDetailSkeleton />;
    if (isError || !tour) return <ErrorState onRetry={() => refetch()} />;

    const mainImageUrl = getPackageHeroImage(tour);

    const defaultIncluded = [
        'Professional local guide',
        'Ground transportation during the tour',
        'Accommodation as per itinerary',
        'Daily breakfast and bottled water',
        'All listed activities and site visits',
    ];

    const defaultExcluded = [
        'International and domestic flights',
        'Travel insurance',
        'Personal expenses and tips',
        'Lunch and dinner unless specified',
        'Visa fees and optional activities',
    ];

    const includedItems = Array.from(new Set([...(tour.included || []), ...defaultIncluded]));
    const excludedItems = Array.from(new Set([...(tour.excluded || []), ...defaultExcluded]));
    const durationDays = Number(tour.durationDetails?.days ?? tour.duration ?? 0);
    const durationNights = Number(tour.durationDetails?.nights ?? Math.max(0, durationDays - 1));
    const destinationLabel = tour.destinations?.length ? tour.destinations.join(', ') : tour.destination;
    const maxGuests = tour.maxGuests || tour.groupSize;

    return (
        <div className="min-h-screen bg-surface">
            <PackageHero tour={tour} mainImageUrl={mainImageUrl} onBack={() => navigate(-1)} />

            <section className="py-16 md:py-24">
                <div className="section-container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2 space-y-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard icon={<Clock3 size={16} />} label="Duration" value={`${durationDays} days / ${durationNights} nights`} />
                                <InfoCard icon={<Users size={16} />} label="Group Size" value={tour.minGuests ? `${tour.minGuests}-${maxGuests} guests` : `Up to ${maxGuests} guests`} />
                                <InfoCard icon={<Wallet size={16} />} label="Pricing Model" value={`${tour.pricingType || 'per_person'} · ${tour.depositPercent ?? 20}% deposit`} />
                                <InfoCard icon={<Calendar size={16} />} label="Booking Cutoff" value={`${tour.bookingCutoffHours ?? 24} hours before departure`} />
                            </div>

                            {(tour.addons?.length || 0) > 0 && (
                                <section className="space-y-4">
                                    <h3 className="text-2xl font-bold text-white">Available Add-ons</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {tour.addons?.map((addon) => (
                                            <div key={addon.name} className="rounded-xl border border-surface-border bg-surface-light p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="font-semibold text-white">{addon.name}</p>
                                                    <Badge variant="secondary">${addon.price}</Badge>
                                                </div>
                                                {addon.description && (
                                                    <p className="text-sm text-neutral-400 mt-1">{addon.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="rounded-2xl border border-surface-border bg-surface-light p-6">
                                <h3 className="text-2xl font-bold text-white mb-3">Before You Book</h3>
                                <ul className="space-y-2 text-neutral-300 text-sm leading-relaxed">
                                    <li>Prices and deposit are finalized at checkout using live enterprise quote rules.</li>
                                    <li>You can choose optional add-ons and submit a full traveler manifest.</li>
                                    <li>If you pick a fixed departure, availability is capacity-protected in real time.</li>
                                    <li>Payment ledger tracks deposit and remaining balance on your booking history.</li>
                                </ul>
                                <div className="flex items-center gap-2 mt-4 text-neutral-400 text-sm">
                                    <MapPin size={15} />
                                    <span>{destinationLabel}</span>
                                </div>
                            </section>

                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                                <PackageOverview tour={tour} />
                            </motion.div>

                            <PackageInclusions includedItems={includedItems} excludedItems={excludedItems} />

                            <PackageItinerary itinerary={tour.itinerary || []} />
                        </div>

                        <PackageBookingSidebar tour={tour} />
                    </div>
                </div>
            </section>
        </div>
    );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-xl border border-surface-border bg-surface-light p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500 font-semibold inline-flex items-center gap-2">
                {icon}
                {label}
            </p>
            <p className="text-white font-bold mt-1 text-lg">{value}</p>
        </div>
    );
}

function TourDetailSkeleton() {
    return (
        <div className="min-h-screen bg-surface">
            <Skeleton className="h-[75vh] w-full" />
            <div className="section-container py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-64 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-96 w-full sticky top-24" />
                    </div>
                </div>
            </div>
        </div>
    );
}
