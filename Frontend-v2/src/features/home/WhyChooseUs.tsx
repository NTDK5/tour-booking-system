import { Shield, Globe, Award, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
    {
        icon: Shield,
        title: 'Safe & Secure',
        description: 'We prioritize your safety with certified guides and secure payment systems.',
        color: 'text-primary',
    },
    {
        icon: Globe,
        title: 'Authentic Experiences',
        description: 'Go beyond the tourist trails and connect with local cultures and traditions.',
        color: 'text-accent',
    },
    {
        icon: Award,
        title: 'Expert Curation',
        description: 'Every tour and lodge is hand-picked for quality, comfort, and authenticity.',
        color: 'text-primary',
    },
    {
        icon: HeartHandshake,
        title: 'Local Empowerment',
        description: 'We work directly with local communities to ensure fair wages and sustainable growth.',
        color: 'text-accent',
    },
];

export function WhyChooseUs() {
    return (
        <section className="py-24 bg-surface-light relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="section-container relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-display-md md:text-display-lg font-bold text-white mb-4">
                        The <span className="text-gradient">Dorze</span> Difference
                    </h2>
                    <p className="text-neutral-400">
                        More than just a travel agency, we are your partners in discovering
                        the soul of Africa through conscious and premium travel.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="glass p-8 rounded-3xl border-white/5 hover:border-primary/20 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="mt-20 pt-20 border-t border-surface-border flex flex-wrap justify-center gap-12 md:gap-24">
                    <div className="text-center">
                        <div className="text-4xl font-extrabold text-white mb-1">10k+</div>
                        <div className="text-xs uppercase tracking-widest text-primary font-bold">Happy Travelers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-extrabold text-white mb-1">50+</div>
                        <div className="text-xs uppercase tracking-widest text-accent font-bold">Local Destinations</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-extrabold text-white mb-1">150+</div>
                        <div className="text-xs uppercase tracking-widest text-primary font-bold">Authentic Tours</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-extrabold text-white mb-1">4.9/5</div>
                        <div className="text-xs uppercase tracking-widest text-accent font-bold">Average Rating</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
