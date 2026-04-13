import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, ListFilter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTours } from '@/hooks/useTours';
import { TourCard } from '@/components/ui/TourCard';
import { TourCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { type TourFilters, type TourType } from '@/types';
import CustomTourBuilder from '@/components/custom/CustomTourBuilder';

export default function ToursPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [filters, setFilters] = useState<TourFilters>({
        page: 1,
        limit: 12,
    });

    const { data, isLoading, isError, refetch } = useTours(filters);

    const TOUR_TYPES: TourType[] = ['cultural', 'adventure', 'wildlife', 'photography', 'trekking', 'historical'];

    const handleFilterChange = (newFilters: Partial<TourFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    return (
        <div className="min-h-screen bg-surface pb-20">
            {/* Header / Search Hero */}
            <div className="bg-surface-light border-b border-surface-border pt-12 pb-16">
                <div className="section-container">
                    <h1 className="text-display-md md:text-display-lg font-bold text-white mb-8">
                        Explore All <span className="text-gradient">Tours</span>
                    </h1>

                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search by destination or activity..."
                            className="w-full h-14 pl-12 pr-4 bg-surface border border-surface-border rounded-2xl outline-none focus:border-primary transition-colors text-white"
                            onChange={(e) => handleFilterChange({ search: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="section-container mt-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters (Desktop) / Dropdown (Mobile) */}
                    <aside className="lg:w-72 shrink-0">
                        <div className="lg:sticky lg:top-24 space-y-8">
                            {/* Desktop Sidebar Title */}
                            <div className="hidden lg:flex items-center gap-2 mb-6">
                                <ListFilter className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-bold text-white">Filters</h3>
                            </div>

                            {/* Mobile Filter Toggle */}
                            <Button
                                variant="secondary"
                                className="lg:hidden w-full justify-between h-12"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </Button>

                            <AnimatePresence>
                                {(isFilterOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-8 lg:block overflow-hidden"
                                    >
                                        {/* Tour Type */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-neutral-400 border-b border-surface-border pb-2 uppercase tracking-widest">Tour Type</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {TOUR_TYPES.map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => handleFilterChange({ tourType: filters.tourType === type ? undefined : type })}
                                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${filters.tourType === type
                                                            ? 'bg-primary border-primary text-white shadow-glow'
                                                            : 'border-surface-border text-neutral-400 hover:border-primary/50'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price Range */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-neutral-400 border-b border-surface-border pb-2 uppercase tracking-widest">Price Range</h4>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                                                    onChange={(e) => handleFilterChange({ minPrice: Number(e.target.value) })}
                                                />
                                                <span className="text-neutral-600">-</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                                                    onChange={(e) => handleFilterChange({ maxPrice: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        {/* Destination */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-neutral-400 border-b border-surface-border pb-2 uppercase tracking-widest">Destination</h4>
                                            <input
                                                type="text"
                                                placeholder="e.g. Lalibela"
                                                className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                                                onChange={(e) => handleFilterChange({ destination: e.target.value || undefined })}
                                            />
                                        </div>

                                        {/* Days */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-neutral-400 border-b border-surface-border pb-2 uppercase tracking-widest">Trip Days</h4>
                                            <input
                                                type="number"
                                                min={1}
                                                placeholder="e.g. 5"
                                                className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                                                onChange={(e) => handleFilterChange({ duration: e.target.value ? Number(e.target.value) : undefined })}
                                            />
                                        </div>

                                        {/* Custom Trip CTA */}
                                        <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 via-surface-light to-surface border border-primary/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-primary/20 transition-all duration-500" />
                                            <Sparkles className="w-8 h-8 text-primary mb-4" />
                                            <h4 className="text-lg font-bold text-white mb-2">Can't find what you're looking for?</h4>
                                            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                                                Design your own premium custom tour with our experts. Choose destinations, activities, and pace.
                                            </p>
                                            <Button
                                                variant="accent"
                                                size="sm"
                                                className="w-full rounded-xl"
                                                onClick={() => setIsBuilderOpen(true)}
                                            >
                                                Start Designing
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </aside>

                    {/* Results Area */}
                    <main className="flex-grow">
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-sm text-neutral-400">
                                Found <span className="text-white font-bold">{data?.total || 0}</span> tours match your search
                            </p>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-neutral-500 hidden sm:block">Sort by:</span>
                                <select
                                    className="bg-transparent text-sm text-white font-bold outline-none cursor-pointer hover:text-primary transition-colors"
                                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                                >
                                    <option value="popularity">Popularity</option>
                                    <option value="price">Price (Low to High)</option>
                                    <option value="rating">Top Rated</option>
                                    <option value="createdAt">Newest First</option>
                                </select>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => <TourCardSkeleton key={i} />)}
                            </div>
                        )}

                        {isError && (
                            <ErrorState onRetry={() => refetch()} />
                        )}

                        {!isLoading && !isError && data?.data.length === 0 && (
                            <EmptyState
                                title="No tours found"
                                description="Try adjusting your filters or search keywords to find what you're looking for."
                                actionLabel="Reset All Filters"
                                onAction={() => setFilters({ page: 1, limit: 12 })}
                            />
                        )}

                        {!isLoading && !isError && data && data.data.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {data.data.map((tour: any) => (
                                    <motion.div
                                        key={tour._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TourCard tour={tour} />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Pagination Placeholder */}
                        {!isLoading && data && data.totalPages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={filters.page === 1}
                                    onClick={() => handleFilterChange({ page: (filters.page || 1) - 1 })}
                                >
                                    Previous
                                </Button>
                                <Badge variant="default" className="w-10 h-10 flex items-center justify-center rounded-xl">
                                    {filters.page}
                                </Badge>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={filters.page === (data?.totalPages || 1)}
                                    onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <AnimatePresence>
                {isBuilderOpen && (
                    <CustomTourBuilder onClose={() => setIsBuilderOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
