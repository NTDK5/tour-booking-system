import { motion } from 'framer-motion';
import { HeroSection } from '@/features/home/HeroSection';
import { FeaturedTours } from '@/features/home/FeaturedTours';
import { WhyChooseUs } from '@/features/home/WhyChooseUs';
import { FeaturedLodges } from '@/features/home/FeaturedLodges';
import { PopularDestinations } from '@/features/home/PopularDestinations';
import { CTASection } from '@/features/home/CTASection';

export default function HomePage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
        >
            <HeroSection />
            <FeaturedTours />
            <WhyChooseUs />
            <PopularDestinations />
            <FeaturedLodges />
            <CTASection />
        </motion.div>
    );
}
