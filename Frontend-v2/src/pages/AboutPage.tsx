import React from 'react';
import { motion } from 'framer-motion';
import {
    Users, Target, Award, Map,
    Globe, Tent, Landmark, Gem,
    ArrowRight, Heart, ArrowRightCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

// Asset imports
import gallery1 from '@/assets/images/gallery1.webp';
import gallery2 from '@/assets/images/gallery2.webp';
import gallery3 from '@/assets/images/gallery3.webp';
import lodgeImage from '@/assets/images/lodge.webp';
import oldCarImage from '@/assets/images/old car.webp';
import recentCarImage from '@/assets/images/recent car.webp';

const stats = [
    { label: 'Founded', value: '2010' },
    { label: 'Happy Travelers', value: '5000+' },
    { label: 'Ethnic Partners', value: '20+' },
    { label: 'UNESCO Sites', value: '9' },
];

const values = [
    {
        icon: Globe,
        title: "Cultural Immersion",
        description: "Authentic interactions with local communities that preserve heritage."
    },
    {
        icon: Tent,
        title: "Adventure Legacy",
        description: "Expert-led expeditions to Ethiopia's most remote and beautiful regions."
    },
    {
        icon: Landmark,
        title: "Historical Expertise",
        description: "Deep insights into the rock-hewn churches and ancient civilizations."
    },
    {
        icon: Heart,
        title: "Community First",
        description: "Every tour directly supports the families and villages we visit."
    },
    {
        icon: Gem,
        title: "Luxury & Comfort",
        description: "Premium experiences ensuring safety and relaxation at every step."
    },
    {
        icon: Map,
        title: "Custom Journeys",
        description: "Tailor-made itineraries designed around your unique interests."
    }
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-surface">
            {/* Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-surface"></div>
                <img
                    src={gallery2}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Ethiopian landscape"
                />
                <div className="relative z-20 text-center px-4 max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 italic"
                    >
                        Our <span className="text-primary italic-none tracking-widest">Story</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-neutral-300 font-light leading-relaxed"
                    >
                        Crafting authentic Ethiopian experiences since 2010. We don't just show you places; we connect you with the soul of our nation.
                    </motion.p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 -mt-20 relative z-30">
                <div className="section-container">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-surface-light p-12 rounded-[32px] border border-surface-border shadow-2xl backdrop-blur-xl">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2 italic">{stat.value}</div>
                                <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24">
                <div className="section-container">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
                                <Target className="w-4 h-4" />
                                Who We Are
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight italic">
                                Unveiling Ethiopia's <span className="text-primary">Hidden Treasures</span>
                            </h2>
                            <p className="text-lg text-neutral-400 leading-relaxed">
                                Embark on an extraordinary journey through the heart of Ethiopia with Dorze Tours.
                                From the rock-hewn churches of Lalibela to the majestic Simien Mountains, we offer
                                immersive cultural experiences and historical explorations.
                            </p>
                            <p className="text-lg text-neutral-400 leading-relaxed">
                                Our team consists of passionate local experts who believe that travel should be
                                transformative. We bridge the gap between visitors and the rich tapestry of
                                Ethiopian life, ensuring every journey leaves a positive impact on the
                                communities we serve.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <img src={gallery1} className="w-full h-80 object-cover rounded-[32px] shadow-xl" alt="Cultural discovery" />
                                <div className="p-8 rounded-[32px] bg-primary flex flex-col justify-center items-center text-center">
                                    <Users className="w-12 h-12 text-surface mb-4" />
                                    <div className="text-3xl font-bold text-surface">20+</div>
                                    <div className="text-xs font-bold text-surface/80 uppercase">Community Partners</div>
                                </div>
                            </div>
                            <div className="pt-12 space-y-4">
                                <div className="p-8 rounded-[32px] border border-surface-border bg-surface-light flex flex-col justify-center items-center text-center">
                                    <Award className="w-12 h-12 text-primary mb-4" />
                                    <div className="text-3xl font-bold text-white">Award</div>
                                    <div className="text-xs font-bold text-neutral-500 uppercase">Winning Service</div>
                                </div>
                                <img src={gallery3} className="w-full h-80 object-cover rounded-[32px] shadow-xl" alt="Landscape" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Journey Section — Old Car to New Car */}
            <section className="py-24 bg-surface-light border-y border-surface-border overflow-hidden">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
                            <ArrowRightCircle className="w-4 h-4" />
                            Our Journey
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 italic">
                            From Humble Beginnings to <span className="text-primary">Premium Adventures</span>
                        </h2>
                        <p className="text-neutral-400 text-lg leading-relaxed">
                            Since 2010, we've grown from a single, dedicated vehicle to a modern premium fleet — 
                            always driven by the same passion for connecting travelers with the real Ethiopia.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
                        {/* Old Car */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="group relative overflow-hidden rounded-[32px] border border-surface-border"
                        >
                            <div className="aspect-[4/3] overflow-hidden">
                                <img
                                    src={oldCarImage}
                                    alt="Our first vehicle"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-700/80 text-neutral-300 text-xs font-bold uppercase tracking-widest mb-3">
                                    Then — 2010
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Where It All Started</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">Our very first tour vehicle — the humble beginning of a big dream to showcase Ethiopia to the world.</p>
                            </div>
                        </motion.div>

                        {/* Arrow - visually between cards, only visible on desktop where grid is 2-col */}
                        {/* (handled via mobile section below) */}
                        {/* Recent Car */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                            className="group relative overflow-hidden rounded-[32px] border border-primary/30"
                        >
                            <div className="aspect-[4/3] overflow-hidden">
                                <img
                                    src={recentCarImage}
                                    alt="Our modern fleet"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3">
                                    Now — 2025
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">The Premium Fleet Today</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">A modern, well-maintained fleet ready to tackle any Ethiopian terrain — from city streets to mountain passes.</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Timeline connector for mobile */}
                    <div className="md:hidden flex items-center justify-center my-4">
                        <div className="flex items-center gap-3">
                            <div className="h-[1px] w-16 bg-surface-border" />
                            <ArrowRight className="w-6 h-6 text-primary" />
                            <div className="h-[1px] w-16 bg-surface-border" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-24">
                <div className="section-container">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why Choose Dorze Tours?</h2>
                        <p className="text-neutral-400">Experience Ethiopia through our commitment to authenticity, sustainability, and excellence.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="p-8 rounded-[32px] bg-surface border border-surface-border hover:border-primary/50 transition-all group">
                                <div className="w-16 h-16 rounded-2xl bg-surface-light border border-surface-border flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                                    <value.icon className="w-8 h-8 text-primary group-hover:text-surface transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                                <p className="text-neutral-500 leading-relaxed text-sm">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Signature Lodge Callout */}
            <section className="py-32 overflow-hidden bg-surface-light border-t border-surface-border">
                <div className="section-container">
                    <div className="relative rounded-[48px] overflow-hidden bg-surface border border-surface-border">
                        <div className="grid lg:grid-cols-2 gap-0 items-center">
                            <div className="p-12 md:p-20 space-y-8">
                                <div className="inline-flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest">
                                    <Gem className="w-4 h-4" />
                                    Our Masterpiece
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white italic">
                                    The Signature <span className="text-primary">Dorze Lodge</span>
                                </h2>
                                <p className="text-neutral-400 leading-relaxed text-lg italic">
                                    "Nestled in the lush highlands, Dorze Lodge offers traditional hospitality with modern comforts. Experience authentic Dorze culture while enjoying breathtaking mountain views."
                                </p>
                                <Link to="/lodges/66f580b0768351ca74219746">
                                    <Button variant="accent" className="h-16 px-10 text-lg font-bold group">
                                        Explore the Lodge
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                            <div className="h-[400px] lg:h-full relative overflow-hidden">
                                <img
                                    src={lodgeImage}
                                    className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100"
                                    alt="Dorze Lodge"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
                <div className="section-container">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 italic">Ready to <span className="text-primary italic-none tracking-tighter underline decoration-white/20">Explore?</span></h2>
                    <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">Your journey through the cradle of civilization begins here. Let us craft your perfect escape.</p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link to="/tours"><Button variant="accent" className="h-16 px-12 text-lg font-bold w-full md:w-auto">View Tour Packages</Button></Link>
                        <Link to="/contact"><Button variant="secondary" className="h-16 px-12 text-lg font-bold w-full md:w-auto bg-transparent border-white/20 text-white">Contact Us</Button></Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
