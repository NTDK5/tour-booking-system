import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Clock, MapPin, Users, Star,
    CheckCircle2, XCircle, ChevronRight,
    Calendar, Share2, Heart,
    ArrowLeft
} from 'lucide-react';
import { useTour } from '@/hooks/useTours';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { resolveImageUrl } from '@/utils/url';

export default function TourDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: tour, isLoading, isError, refetch } = useTour(id!);

    if (isLoading) return <TourDetailSkeleton />;
    if (isError || !tour) return <ErrorState onRetry={() => refetch()} />;

    console.log(`Tour ${tour.title} images detail:`, { images: tour.images, imageUrl: tour.imageUrl });
    const mainImageUrl = resolveImageUrl(tour.images?.[0] || tour.imageUrl?.[0]);
    console.log(`Resolved URL for detail ${tour.title}:`, mainImageUrl);

    const tourTypeColors: Record<string, string> = {
        cultural: 'bg-primary/20 text-primary',
        adventure: 'bg-accent/20 text-accent',
        historical: 'bg-blue-500/20 text-blue-400',
        trekking: 'bg-green-500/20 text-green-400',
    };

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
            {/* Hero Section / Gallery */}
            <section className="relative h-[60vh] md:h-[75vh] group overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={mainImageUrl}
                        alt={tour.title}
                        crossOrigin="anonymous"
                        onError={(e) => {
                            console.error(`Failed to load main image for ${tour.title}:`, mainImageUrl);
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=No+Image';
                            (e.target as HTMLImageElement).onerror = null;
                        }}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                </div>

                <div className="section-container relative h-full flex flex-col justify-end pb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-8 left-4 md:left-0 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-surface/40 backdrop-blur-md px-4 py-2 rounded-full"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Explore
                    </button>

                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <Badge className={tourTypeColors[tour.tourType] || 'bg-white/10'}>
                            {tour.tourType}
                        </Badge>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                            {tour.rating} ({tour.reviewCount} Reviews)
                        </div>
                    </div>

                    <h1 className="text-display-md md:text-display-xl font-extrabold text-white mb-4 leading-tight">
                        {tour.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-neutral-300">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span>{tour.destination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            <span>{tour.duration} Days</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            <span>Max {tour.groupSize} People</span>
                        </div>
                    </div>
                </div>

                {/* Floating Actions */}
                <div className="absolute top-8 right-4 md:right-8 flex gap-3">
                    <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20 group">
                        <Heart className="w-5 h-5 group-hover:fill-error group-hover:text-error transition-colors" />
                    </button>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-24">
                <div className="section-container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                        {/* Left Content */}
                        <div className="lg:col-span-2 space-y-16">

                            {/* Description */}
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-6">Adventure <span className="text-gradient">Overview</span></h2>
                                <p className="text-lg text-neutral-400 leading-relaxed whitespace-pre-line">
                                    {tour.description}
                                </p>
                            </div>

                            {/* Highlights */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tour.highlights?.map((highlight, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex gap-4 p-4 rounded-2xl bg-surface-light border border-surface-border"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                        </div>
                                        <p className="text-neutral-300 text-sm font-medium leading-relaxed">{highlight}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Inclusions / Exclusions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 border-y border-surface-border">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-success" />
                                        What's Included
                                    </h3>
                                    <ul className="space-y-4">
                                        {includedItems.map((item, idx) => (
                                            <li key={idx} className="flex gap-3 text-neutral-400 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-error" />
                                        Not Included
                                    </h3>
                                    <ul className="space-y-4">
                                        {excludedItems.map((item, idx) => (
                                            <li key={idx} className="flex gap-3 text-neutral-400 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Itinerary */}
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-10">Your <span className="text-gradient">Itinerary</span></h2>
                                <div className="space-y-4">
                                    {tour.itinerary?.map((day, idx) => (
                                        <div key={idx} className="relative pl-12 pb-12 last:pb-0">
                                            {/* Connector Line */}
                                            {idx !== tour.itinerary.length - 1 && (
                                                <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-surface-border" />
                                            )}

                                            {/* Day Circle */}
                                            <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-surface-light border-2 border-primary flex items-center justify-center text-primary font-bold z-10">
                                                {idx + 1}
                                            </div>

                                            <div className="bg-surface-light rounded-3xl p-6 border border-surface-border shadow-soft">
                                                <h4 className="text-2xl font-bold text-white mb-3">{day.title}</h4>
                                                <p className="text-neutral-300 text-lg leading-relaxed">{day.description}</p>

                                                {day.activities && day.activities.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        {day.activities.map((act, i) => {
                                                            const isObject = typeof act === 'object' && act !== null;
                                                            const label = isObject ? (act as any).activity : act;
                                                            const time = isObject ? (act as any).time : '';

                                                            return (
                                                                <Badge key={i} variant="secondary" className="bg-surface text-sm gap-1.5 py-2 px-3.5">
                                                                    {time && <span className="text-primary/70 font-mono uppercase tracking-tighter">{time}</span>}
                                                                    <span>{label}</span>
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Right Sidebar - Sticky Booking */}
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

                                    <Link to={`/booking/${tour._id}`}>
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

                                {/* Trust Badges */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-surface-light/50 p-4 rounded-2xl border border-surface-border text-center">
                                        <Badge variant="accent" className="mb-2">Verified</Badge>
                                        <p className="text-[10px] text-neutral-500">Dorze Certified</p>
                                    </div>
                                    <div className="bg-surface-light/50 p-4 rounded-2xl border border-surface-border text-center">
                                        <Badge variant="secondary" className="mb-2">Support</Badge>
                                        <p className="text-[10px] text-neutral-500">24/7 Assistance</p>
                                    </div>
                                </div>
                            </div>
                        </div>

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
