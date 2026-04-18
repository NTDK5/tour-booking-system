import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { Tour } from '@/types';

interface PackageOverviewProps {
    tour: Tour;
}

export function PackageOverview({ tour }: PackageOverviewProps) {
    const body = tour.fullDescription ?? tour.shortDescription ?? tour.description;

    return (
        <>
            <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                    Adventure <span className="text-gradient">Overview</span>
                </h2>
                <p className="text-lg text-neutral-400 leading-relaxed whitespace-pre-line">{body}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tour.highlights?.map((highlight, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-4 p-4 rounded-2xl bg-surface-light border border-surface-border"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-neutral-300 text-sm font-medium leading-relaxed">{highlight}</p>
                    </motion.div>
                ))}
            </div>
        </>
    );
}
