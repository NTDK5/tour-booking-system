import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Hotel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLodges } from '@/hooks/useLodges';
import { LodgeCard } from '@/components/ui/LodgeCard';
import { LodgeCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { type LodgeFilters } from '@/types';

export default function LodgesPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState<LodgeFilters>({
        page: 1,
        limit: 12,
    });

    const { data, isLoading, isError, refetch } = useLodges(filters);

    const handleFilterChange = (newFilters: Partial<LodgeFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    return (
        <div className="min-h-screen bg-surface pb-20">
            {/* Header */}
            <div className="bg-surface-light border-b border-surface-border pt-12 pb-16">
                <div className="section-container text-center md:text-left">
                    <h1 className="text-display-md md:text-display-lg font-bold text-white mb-8">
                        Luxury <span className="text-gradient-accent">Eco-Lodges</span>
                    </h1>

                    <div className="relative max-w-2xl mx-auto md:mx-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search by lodge name or location..."
                            className="w-full h-14 pl-12 pr-4 bg-surface border border-surface-border rounded-2xl outline-none focus:border-accent transition-colors text-white"
                            onChange={(e) => handleFilterChange({ search: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="section-container mt-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters */}
                    <aside className="lg:w-72 shrink-0">
                        <div className="lg:sticky lg:top-24 space-y-8">
                            <Button
                                variant="secondary"
                                className="lg:hidden w-full justify-between h-12"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-accent" />
                                    Filters
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </Button>

                            <AnimatePresence>
                                {(isFilterOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-8 lg:block overflow-hidden"
                                    >
                                        {/* Price Range */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-neutral-400 border-b border-surface-border pb-2 uppercase tracking-widest">Price Per Night</h4>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent"
                                                    onChange={(e) => handleFilterChange({ minPrice: Number(e.target.value) })}
                                                />
                                                <span className="text-neutral-600">-</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    className="w-full bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent"
                                                    onChange={(e) => handleFilterChange({ maxPrice: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        {/* Amenities (Simulated) */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-neutral-400 border-b border-surface-border pb-2 uppercase tracking-widest">Amenities</h4>
                                            <div className="flex flex-col gap-2">
                                                {['Wifi', 'Breakfast', 'Pool', 'Parking'].map(amenity => (
                                                    <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className="w-5 h-5 rounded border border-surface-border bg-surface-light group-hover:border-accent transition-colors flex items-center justify-center">
                                                            {/* Checkbox SVG would go here */}
                                                        </div>
                                                        <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">{amenity}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </aside>

                    {/* Results */}
                    <main className="flex-grow">
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-sm text-neutral-400">
                                <span className="text-white font-bold">{data?.total || 0}</span> lodges available
                            </p>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-neutral-500">Sort:</span>
                                <select
                                    className="bg-transparent text-sm text-white font-bold outline-none cursor-pointer border-none"
                                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                                >
                                    <option value="rating">Top Rated First</option>
                                    <option value="pricePerNight">Price (Low-High)</option>
                                    <option value="createdAt">New Arrivals</option>
                                </select>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(4)].map((_, i) => <LodgeCardSkeleton key={i} />)}
                            </div>
                        )}

                        {isError && <ErrorState onRetry={() => refetch()} />}

                        {!isLoading && !isError && data?.data.length === 0 && (
                            <EmptyState
                                icon={Hotel}
                                title="No lodges found"
                                description="Try different dates or search terms to see available stays."
                                actionLabel="Clear Filters"
                                onAction={() => setFilters({ page: 1, limit: 12 })}
                            />
                        )}

                        {!isLoading && !isError && data && data.data.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {data.data.map((lodge) => (
                                        <motion.div
                                            key={lodge._id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <LodgeCard lodge={lodge} />
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {data.totalPages > 1 && (
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
                                            disabled={filters.page === data.totalPages}
                                            onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
