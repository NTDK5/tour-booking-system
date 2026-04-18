import {
    Clock,
    MapPin,
    Users,
    Star,
    ArrowLeft,
    Share2,
    Heart,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Tour } from '@/types';
import { resolveImageUrl } from '@/utils/url';

interface PackageHeroProps {
    tour: Tour;
    mainImageUrl: string;
    onBack: () => void;
}

export function PackageHero({ tour, mainImageUrl, onBack }: PackageHeroProps) {
    const tourTypeColors: Record<string, string> = {
        cultural: 'bg-primary/20 text-primary',
        adventure: 'bg-accent/20 text-accent',
        historical: 'bg-blue-500/20 text-blue-400',
        trekking: 'bg-green-500/20 text-green-400',
    };

    return (
        <section className="relative h-[60vh] md:h-[75vh] group overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src={mainImageUrl}
                    alt={tour.title}
                    crossOrigin="anonymous"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=No+Image';
                        (e.target as HTMLImageElement).onerror = null;
                    }}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            </div>

            <div className="section-container relative h-full flex flex-col justify-end pb-12">
                <button
                    type="button"
                    onClick={onBack}
                    className="absolute top-8 left-4 md:left-0 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-surface/40 backdrop-blur-md px-4 py-2 rounded-full"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Explore
                </button>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge className={tourTypeColors[tour.tourType] || 'bg-white/10'}>{tour.tourType}</Badge>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        {tour.rating} ({tour.reviewCount} Reviews)
                    </div>
                </div>

                <h1 className="text-display-md md:text-display-xl font-extrabold text-white mb-4 leading-tight">{tour.title}</h1>

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

            <div className="absolute top-8 right-4 md:right-8 flex gap-3">
                <button
                    type="button"
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
                >
                    <Share2 className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20 group"
                >
                    <Heart className="w-5 h-5 group-hover:fill-error group-hover:text-error transition-colors" />
                </button>
            </div>
        </section>
    );
}

export function getPackageHeroImage(tour: Tour): string {
    return resolveImageUrl(tour.images?.[0] || tour.imageUrl?.[0]);
}
