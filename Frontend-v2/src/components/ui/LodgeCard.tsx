import { Link } from 'react-router-dom';
import { Star, MapPin, Wifi, Coffee, Car } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { type Lodge } from '@/types';

interface LodgeCardProps {
    lodge: Lodge;
}

export function LodgeCard({ lodge }: LodgeCardProps) {
    const {
        _id,
        name,
        location,
        images,
        pricePerNight,
        rating,
        reviewCount,
        amenities,
        featured,
    } = lodge;

    return (
        <Link
            to={`/lodges/${_id}`}
            className="group block card card-hover"
        >
            <div className="relative aspect-video overflow-hidden">
                <img
                    src={images[0] || 'https://via.placeholder.com/400x225?text=No+Image'}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />

                <div className="absolute top-4 left-4">
                    {featured && <Badge variant="accent">Top Rated</Badge>}
                </div>

                <div className="absolute bottom-4 right-4">
                    <div className="bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span className="text-xs font-bold text-white">{(rating ?? 0).toFixed(1)}</span>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-3">
                <div>
                    <div className="flex items-center gap-1 text-neutral-400 text-xs mb-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span>{location}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    {amenities.slice(0, 3).map((amenity) => (
                        <div key={amenity} className="text-neutral-500" title={amenity}>
                            {amenity.toLowerCase().includes('wifi') && <Wifi className="w-4 h-4" />}
                            {amenity.toLowerCase().includes('breakfast') && <Coffee className="w-4 h-4" />}
                            {amenity.toLowerCase().includes('parking') && <Car className="w-4 h-4" />}
                        </div>
                    ))}
                    {amenities.length > 3 && (
                        <span className="text-[10px] text-neutral-500">+{amenities.length - 3} more</span>
                    )}
                </div>

                <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-white">${pricePerNight}</span>
                        <span className="text-xs text-neutral-500">/ night</span>
                    </div>
                    <div className="text-xs text-neutral-400">
                        {reviewCount} reviews
                    </div>
                </div>
            </div>
        </Link>
    );
}
