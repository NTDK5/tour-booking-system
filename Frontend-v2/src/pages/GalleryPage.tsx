import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, MapPin } from 'lucide-react';

// Local image imports
import gallery1 from '@/assets/images/gallery1.webp';
import gallery2 from '@/assets/images/gallery2.webp';
import gallery3 from '@/assets/images/gallery3.webp';
import lodgeImg from '@/assets/images/lodge.webp';
import heroImg from '@/assets/images/hero1.webp';
import addisAbaba from '@/assets/images/addis_ababa_image_main.webp';
import lalibela from '@/assets/images/lalibela_main.webp';
import baleMountains from '@/assets/images/bale_mountains.webp';
import bahirDar from '@/assets/images/bahir_dar_main.webp';
import omoValley from '@/assets/images/omo_valley_main.webp';
import tigray from '@/assets/images/tigray_main.jpg';
import oldCar from '@/assets/images/old car.webp';
import recentCar from '@/assets/images/recent car.webp';

const photos = [
    { id: 1, src: gallery1, category: 'Culture', location: 'Dorze Village', title: 'Traditional Weaving' },
    { id: 2, src: gallery2, category: 'Nature', location: 'Simien Mountains', title: 'Highland Vistas' },
    { id: 3, src: gallery3, category: 'Culture', location: 'Ancient Temples', title: 'Ancient Faith' },
    { id: 4, src: lodgeImg, category: 'Lodge', location: 'Dorze Lodge', title: 'Highland Comfort' },
    { id: 5, src: lalibela, category: 'Culture', location: 'Lalibela', title: 'Rock-Hewn Churches' },
    { id: 6, src: addisAbaba, category: 'City', location: 'Addis Ababa', title: 'The Capital City' },
    { id: 7, src: baleMountains, category: 'Nature', location: 'Bale Mountains', title: 'Alpine Wilderness' },
    { id: 8, src: bahirDar, category: 'Nature', location: 'Bahir Dar', title: 'Lake Tana Shores' },
    { id: 9, src: omoValley, category: 'Culture', location: 'Omo Valley', title: 'Tribal Heritage' },
    { id: 10, src: tigray, category: 'Culture', location: 'Tigray Region', title: 'Historical Tigray' },
    { id: 11, src: oldCar, category: 'Tours', location: 'Dorze Tours', title: 'Our Early Days' },
    { id: 12, src: recentCar, category: 'Tours', location: 'Dorze Tours', title: 'Modern Fleet' },
    { id: 13, src: heroImg, category: 'Nature', location: 'Ethiopian Highlands', title: 'Untouched Beauty' },
];

const categories = ['All', 'Culture', 'Nature', 'Lodge', 'City', 'Tours'];

export default function GalleryPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

    const filteredPhotos = selectedCategory === 'All'
        ? photos
        : photos.filter(p => p.category === selectedCategory);

    return (
        <div className="min-h-screen bg-surface py-20 md:py-32">
            <div className="section-container">
                {/* Header */}
                <header className="text-center mb-20 max-w-3xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-bold text-white mb-6 italic"
                    >
                        Visual <span className="text-primary italic-none tracking-widest">Journey</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-neutral-400 text-lg md:text-xl font-light leading-relaxed"
                    >
                        Discover the breathtaking landscapes and rich cultural heritage of Ethiopia through our lens. Every frame tells a story of faith, resilience, and beauty.
                    </motion.p>
                </header>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-20">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat
                                ? 'bg-primary text-surface border-primary'
                                : 'bg-surface-light text-neutral-400 border-surface-border hover:border-primary/50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Masonry-style Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredPhotos.map((photo) => (
                            <motion.div
                                key={photo.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative cursor-pointer aspect-[4/5] overflow-hidden rounded-[32px] border border-surface-border bg-surface-light"
                                onClick={() => setSelectedPhoto(photo)}
                            >
                                <img
                                    src={photo.src}
                                    alt={photo.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-0 left-0 p-8 w-full">
                                        <div className="text-primary text-xs font-bold uppercase tracking-widest mb-2">{photo.category}</div>
                                        <h3 className="text-xl font-bold text-white mb-2">{photo.title}</h3>
                                        <div className="flex items-center gap-2 text-neutral-300 text-sm">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            {photo.location}
                                        </div>
                                    </div>
                                    <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-surface/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                                        <Maximize2 className="w-5 h-5" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Lightbox / Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] p-4 md:p-10 flex items-center justify-center bg-black/95 backdrop-blur-xl"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <button
                            className="absolute top-8 right-8 text-neutral-500 hover:text-white transition-colors"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X className="w-10 h-10" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-6xl w-full max-h-full aspect-video md:aspect-[16/9] overflow-hidden rounded-[40px] border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedPhoto.src}
                                alt={selectedPhoto.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black via-black/60 to-transparent">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div>
                                        <div className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-3">{selectedPhoto.category}</div>
                                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 italic">{selectedPhoto.title}</h2>
                                        <div className="flex items-center gap-2 text-neutral-400">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            <span className="text-lg">{selectedPhoto.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
