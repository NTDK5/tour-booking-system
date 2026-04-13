import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import addisAbaba from '@/assets/images/addis_ababa_image_main.webp';
import lalibela from '@/assets/images/lalibela_main.webp';
import baleMountains from '@/assets/images/bale_mountains.webp';
import bahirDar from '@/assets/images/bahir_dar_main.webp';
import omoValley from '@/assets/images/omo_valley_main.webp';
import tigray from '@/assets/images/tigray_main.jpg';

const DESTINATIONS = [
    {
        name: 'Lalibela',
        tours: 15,
        image: lalibela,
        className: 'md:col-span-2 md:row-span-2',
    },
    {
        name: 'Addis Ababa',
        tours: 10,
        image: addisAbaba,
        className: 'md:col-span-1 md:row-span-1',
    },
    {
        name: 'Tigray',
        tours: 8,
        image: tigray,
        className: 'md:col-span-1 md:row-span-1',
    },
    {
        name: 'Bale Mountains',
        tours: 7,
        image: baleMountains,
        className: 'md:col-span-1 md:row-span-1',
    },
    {
        name: 'Bahir Dar',
        tours: 9,
        image: bahirDar,
        className: 'md:col-span-1 md:row-span-1',
    },
    {
        name: 'Omo Valley',
        tours: 8,
        image: omoValley,
        className: 'md:col-span-2 md:row-span-1',
    },
];

export function PopularDestinations() {
    const navigate = useNavigate();

    return (
        <section className="py-24 bg-surface">
            <div className="section-container">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-display-md font-bold text-white mb-4">Popular <span className="text-gradient">Destinations</span></h2>
                    <p className="text-neutral-400 max-w-xl mx-auto">
                        From peaks to hollows, explore the most iconic landscapes of the Ethiopian Highlands and beyond.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[220px] md:grid-rows-3">
                    {DESTINATIONS.map((dest, index) => (
                        <motion.div
                            key={dest.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            onClick={() => navigate('/tours')}
                            className={`relative overflow-hidden rounded-3xl group cursor-pointer ${dest.className}`}
                        >
                            <img
                                src={dest.image}
                                alt={dest.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                            <div className="absolute bottom-6 left-6">
                                <h3 className="text-2xl font-bold text-white mb-1">{dest.name}</h3>
                                <p className="text-sm text-primary font-semibold">{dest.tours} Tours</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
