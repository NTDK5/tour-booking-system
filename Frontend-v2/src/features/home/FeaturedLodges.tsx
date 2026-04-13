import { LodgeCard } from '@/components/ui/LodgeCard';
import { type Lodge } from '@/types';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

const MOCK_LODGES: Partial<Lodge>[] = [
    {
        _id: '66f580b0768351ca74219746',
        name: 'Dorze Lodge',
        location: 'Dorze, Ethiopia',
        images: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800'],
        pricePerNight: 120,
        rating: 4.9,
        reviewCount: 128,
        amenities: ['Wifi', 'Breakfast', 'Parking', 'Restaurant'],
        featured: true,
    },
    {
        _id: 'L2',
        name: 'Gheralta Lodge',
        location: 'Tigray Mountains',
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'],
        pricePerNight: 220,
        rating: 4.7,
        reviewCount: 56,
        amenities: ['Restaurant', 'Hiking Guide', 'Cultural Tours'],
        featured: false,
    },
    {
        _id: 'L3',
        name: 'Bishangari Lodge',
        location: 'Lake Langano',
        images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800'],
        pricePerNight: 180,
        rating: 4.5,
        reviewCount: 38,
        amenities: ['Wifi', 'Water Sports', 'Bird Watching'],
        featured: false,
    },
];

import { useLodges } from '@/hooks/useLodges';

export function FeaturedLodges() {
    const { data: lodgesResponse, isLoading } = useLodges({ featured: true, limit: 3 });
    const lodges = lodgesResponse?.data || [];

    if (isLoading) {
        return (
            <section className="py-24 bg-surface-light">
                <div className="section-container">
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (lodges.length === 0) return null;

    return (
        <section className="py-24 bg-surface-light">
            <div className="section-container">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-display-md font-bold text-white mb-3">
                            Luxury <span className="text-gradient-accent">Eco-Lodges</span>
                        </h2>
                        <p className="text-neutral-400 max-w-lg">
                            Stay in harmony with nature without compromising on premium comfort.
                            Our lodges are selected for their sustainability and stunning views.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="border-accent text-accent hover:bg-accent hover:text-surface"
                        onClick={() => window.location.href = '/lodges'}
                    >
                        Explore All Lodges
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {lodges.map((lodge) => (
                        <LodgeCard key={lodge._id} lodge={lodge} />
                    ))}
                </div>
            </div>
        </section>
    );
}
