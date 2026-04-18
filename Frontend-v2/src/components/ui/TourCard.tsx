import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { type Tour } from '@/types';
import { resolveImageUrl } from '@/utils/url';

interface TourCardProps {
    tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
    const {
        _id,
        title,
        destination,
        duration,
        groupSize,
        price,
        discountPrice,
        images,
        imageUrl,
        rating,
        reviewCount,
        tourType,
        featured,
    } = tour;

    const resolvedUrl = resolveImageUrl(images?.[0] || imageUrl?.[0]);

    const displayPrice = discountPrice || price;
    const hasDiscount = !!discountPrice && discountPrice < price;

    return (
        <Link
            to={`/tours/${_id}`}
            className="group block card card-hover"
        >
            {/* Image Section */}
            <div className="relative aspect-tour-card overflow-hidden">
                <img
                    src={resolvedUrl}
                    alt={title}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-card-gradient" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {featured && <Badge variant="accent">Featured</Badge>}
                    <Badge variant="default" className="capitalize">{tourType}</Badge>
                </div>

                {hasDiscount && (
                    <div className="absolute top-4 right-4 animate-bounce">
                        <Badge variant="success">Save ${price - discountPrice}</Badge>
                    </div>
                )}

                {/* Rating Overlay */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-surface/60 backdrop-blur-md px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-xs font-bold text-white">{rating?.toFixed(1) ?? '0.0'}</span>
                    <span className="text-[10px] text-neutral-300">({reviewCount || 0})</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 space-y-4">
                <div>
                    <div className="flex items-center gap-1 text-primary-300 text-xs font-medium mb-1">
                        <MapPin className="w-3 h-3" />
                        <span>{destination}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{duration} Days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>Up to {groupSize}</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-surface-border flex items-end justify-between">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-xs text-neutral-500 line-through">${price}</span>
                        )}
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">${displayPrice}</span>
                            <span className="text-[10px] text-neutral-400">/ person</span>
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-primary group-hover:underline underline-offset-4">
                        View Details
                    </span>
                </div>
            </div>
        </Link>
    );
}
