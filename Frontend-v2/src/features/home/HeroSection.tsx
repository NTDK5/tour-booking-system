import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Compass, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';

import hero1 from '@/assets/images/Hero2.jpg';
import hero2 from '@/assets/images/hero3.jpg';
import hero3 from '@/assets/images/hero4.jpg';

const SLIDES = [
    {
        image: hero1,
        title: "Unforgettable Journeys to Hidden Horizons",
        subtitle: "From the rugged Simien Mountains to the vibrant cultures of the Omo Valley, experience Africa's most authentic adventures.",
        badge: "Discover the Heart of Ethiopia"
    },
    {
        image: hero2,
        title: "The Surreal Beauty of Danakil Depression",
        subtitle: "Embark on an epic expedition to the lowest and hottest place on earth, where neon-colored lakes and salt plains await.",
        badge: "Extreme Adventure Awaits"
    },
    {
        image: hero3,
        title: "Sacred Heritage of Ancient Rock-Hewn Churches",
        subtitle: "Journey through time in Lalibela, witness the architectural marvels carved from solid volcanic rock in the 12th century.",
        badge: "Spiritual Exploration"
    }
];

export function HeroSection() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

    return (
        <section className="relative h-[95vh] flex items-center overflow-hidden bg-surface">
            {/* Background Slider */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={SLIDES[currentSlide].image}
                        alt="Hero background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/20" />
                </motion.div>
            </AnimatePresence>

            <div className="section-container relative z-10 w-full">
                <div className="max-w-4xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                        >
                            <Badge variant="accent" className="mb-8 px-6 py-2 text-sm uppercase tracking-widest font-bold">
                                {SLIDES[currentSlide].badge}
                            </Badge>
                            <h1 className="text-4xl md:text-6xl lg:text-display-2xl font-extrabold text-white mb-6 md:mb-8 leading-[1.1]">
                                {SLIDES[currentSlide].title.split(' ').map((word, i) => (
                                    <span key={i} className={i > 3 ? 'text-gradient' : ''}>{word} </span>
                                ))}
                            </h1>
                            <p className="text-xl text-neutral-300 mb-12 leading-relaxed max-w-2xl font-medium">
                                {SLIDES[currentSlide].subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                                <Button size="lg" className="h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg group rounded-2xl shadow-xl shadow-primary/20 w-full sm:w-auto" onClick={() => navigate('/tours')}>
                                    Explore Tours
                                    <Compass className="ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-45 transition-transform" />
                                </Button>
                                <Button size="lg" variant="secondary" className="h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 w-full sm:w-auto" onClick={() => navigate('/lodges')}>
                                    View Lodges
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Search Bar Overlay - Hidden on very small screens to save space, visible on >sm */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="mt-8 sm:mt-12 lg:mt-32 w-full hidden sm:block"
                >
                    <div className="glass-dark p-3 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-3 max-w-6xl border border-white/5">
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-3 w-full px-6">
                            <div className="flex items-center gap-4 py-4 border-b md:border-b-0 md:border-r border-white/10">
                                <MapPin className="w-6 h-6 text-primary" />
                                <div className="flex flex-col flex-grow">
                                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">Destination</span>
                                    <input
                                        type="text"
                                        placeholder="Where to?"
                                        className="bg-transparent border-none outline-none text-white placeholder:text-neutral-700 text-base font-bold w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 py-4 border-b md:border-b-0 md:border-r border-white/10">
                                <Calendar className="w-6 h-6 text-primary" />
                                <div className="flex flex-col flex-grow">
                                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">When</span>
                                    <input
                                        type="text"
                                        placeholder="Add dates"
                                        className="bg-transparent border-none outline-none text-white placeholder:text-neutral-700 text-base font-bold w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 py-4">
                                <Users className="w-6 h-6 text-primary" />
                                <div className="flex flex-col flex-grow">
                                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">Guests</span>
                                    <input
                                        type="text"
                                        placeholder="How many?"
                                        className="bg-transparent border-none outline-none text-white placeholder:text-neutral-700 text-base font-bold w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button size="icon" className="w-full md:w-20 h-16 md:h-20 rounded-2xl md:rounded-full shrink-0 shadow-lg shadow-primary/30">
                            <Search className="w-7 h-7" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Pagination Dots */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-4">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-primary h-12' : 'bg-white/30 hover:bg-white/50'
                            }`}
                    />
                ))}
            </div>

            {/* Slider Navigation Arrows */}
            <div className="absolute bottom-12 right-12 z-20 flex gap-4">
                <button
                    onClick={prevSlide}
                    className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all group"
                >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                    onClick={nextSlide}
                    className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all group"
                >
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </section>
    );
}
