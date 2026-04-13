import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { TourCard } from '@/components/ui/TourCard';
import { type Tour } from '@/types';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { useTours } from '@/hooks/useTours';

export function FeaturedTours() {
    const { data, isLoading, isError } = useTours({ featured: true, limit: 10 });
    const featuredTours = data?.data || [];

    if (isLoading) {
        return (
            <section className="py-24 bg-surface">
                <div className="section-container">
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (isError || featuredTours.length === 0) return null;

    return (
        <section className="py-24 bg-surface overflow-hidden">
            <div className="section-container">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-display-md md:text-display-lg font-bold text-white mb-4">
                            Trending <span className="text-gradient">Adventures</span>
                        </h2>
                        <p className="text-neutral-400">
                            Our most popular experiences, hand-picked by local experts for their
                            authenticity and breathtaking beauty.
                        </p>
                    </div>
                    <Button variant="ghost" className="group" onClick={() => window.location.href = '/tours'}>
                        View All Tours
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <Swiper
                        modules={[Pagination, Navigation, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                            1280: { slidesPerView: 4 },
                        }}
                        className="pb-16"
                    >
                        {featuredTours.map((tour) => (
                            <SwiperSlide key={tour._id}>
                                <TourCard tour={tour} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </motion.div>
            </div>
        </section>
    );
}
