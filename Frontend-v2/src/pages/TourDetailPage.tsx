import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTour } from '@/hooks/useTours';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { PackageHero, getPackageHeroImage } from '@/features/packages/components/PackageHero';
import { PackageOverview } from '@/features/packages/components/PackageOverview';
import { PackageInclusions } from '@/features/packages/components/PackageInclusions';
import { PackageItinerary } from '@/features/packages/components/PackageItinerary';
import { PackageBookingSidebar } from '@/features/packages/components/PackageBookingSidebar';

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

    return (
        <div className="min-h-screen bg-surface">
            <PackageHero tour={tour} mainImageUrl={mainImageUrl} onBack={() => navigate(-1)} />

            <section className="py-16 md:py-24">
                <div className="section-container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2 space-y-16">
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
