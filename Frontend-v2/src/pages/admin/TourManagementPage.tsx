import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Globe,
    Plus,
    Edit,
    Trash2,
    Eye,
    Users,
    Clock,
    MapPin,
    Calendar,
    Activity,
    AlertCircle,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDeleteTour, tourKeys } from '@/hooks/useTours';
import { adminPackagesApi } from '@/api/packages';
import { Skeleton } from '@/components/ui/Skeleton';
import { PackageBuilderModal } from '@/features/admin/packages/PackageBuilderModal';
import type { Tour } from '@/types';
import { bookingsApi } from '@/api/bookings';
import { DepartureAssignmentPanel } from '@/features/admin/assignments/DepartureAssignmentPanel';

function mapAdminRowToTour(t: Record<string, any>): Tour {
    const dest = Array.isArray(t.destinations) && t.destinations.length ? t.destinations[0] : t.destination || '';
    const days = t.duration?.days ?? (typeof t.duration === 'number' ? t.duration : 1);
    return {
        ...t,
        _id: String(t._id),
        title: t.title || '',
        description: t.description || t.fullDescription || '',
        destination: dest,
        duration: typeof days === 'number' ? days : 1,
        durationDetails: t.duration && typeof t.duration === 'object' ? t.duration : undefined,
        destinations: Array.isArray(t.destinations) ? t.destinations : undefined,
        groupSize: t.maxGuests ?? t.groupSize ?? 10,
        minGuests: t.minGuests ?? undefined,
        maxGuests: t.maxGuests ?? t.groupSize ?? undefined,
        bookingCutoffHours: t.bookingCutoffHours ?? undefined,
        price: t.basePrice ?? t.price ?? 0,
        basePrice: t.basePrice ?? t.price ?? 0,
        pricingType: t.pricingType ?? 'per_person',
        depositPercent: t.depositPercent ?? 20,
        addons: Array.isArray(t.addons) ? t.addons : [],
        images: t.gallery || t.images || t.imageUrl || [],
        highlights: t.highlights || [],
        included: t.included || [],
        excluded: t.excluded || [],
        itinerary: t.itinerary || [],
        tourType: t.tourType || 'cultural',
        difficulty: t.difficulty || 'moderate',
        rating: t.averageRating ?? 0,
        reviewCount: t.totalRatings ?? 0,
        featured: !!t.featured,
        tags: t.tags || [],
        createdAt: t.createdAt || '',
        updatedAt: t.updatedAt || '',
    } as Tour;
}

export default function TourManagementPage() {
    const queryClient = useQueryClient();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [detailTour, setDetailTour] = useState<Tour | null>(null);
    const [postLoginAction, setPostLoginAction] = useState<any>((location.state as any)?.postLoginAction || null);

    useEffect(() => {
        const action = (location.state as any)?.postLoginAction;
        if (action) setPostLoginAction(action);
    }, [location.state]);

    const { data: toursData, isLoading, error } = useQuery({
        queryKey: ['admin-packages'],
        queryFn: () => adminPackagesApi.list({ limit: 200 }),
    });

    const deleteTour = useDeleteTour();

    const handleEdit = (tour: Tour) => {
        setSelectedTour(tour);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedTour(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this tour?')) {
            await deleteTour.mutateAsync(id);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-light rounded-2xl border border-surface-border">
                <AlertCircle size={48} className="text-error mb-4" />
                <h3 className="text-xl font-bold">Failed to load tours</h3>
                <p className="text-muted-foreground mt-2">There was an error connecting to the server.</p>
                <Button onClick={() => window.location.reload()} className="mt-6">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tour Inventory</h2>
                    <p className="text-muted-foreground">Manage tour itineraries, departures, and group capacities.</p>
                </div>
                <Button className="gap-2" onClick={handleCreate}>
                    <Plus size={18} />
                    New Tour
                </Button>
            </div>

            {isModalOpen && (
                <PackageBuilderModal
                    tour={selectedTour}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => {
                        queryClient.invalidateQueries({ queryKey: tourKeys.all });
                        queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
                    }}
                />
            )}
            {detailTour && (
                <TourDetailsModal
                    tour={detailTour}
                    onClose={() => setDetailTour(null)}
                    postLoginAction={postLoginAction}
                    onPostLoginActionConsumed={() => setPostLoginAction(null)}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <Skeleton key={i} className="h-[300px] rounded-2xl" />)
                ) : toursData?.data.map((raw) => {
                    const tour = mapAdminRowToTour(raw as Record<string, any>);
                    const durationText = `${tour.duration}D${tour.durationDetails?.nights != null ? ` / ${tour.durationDetails.nights}N` : ''}`;
                    return (
                    <div key={tour._id} className="bg-surface-light border border-surface-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-primary/50 flex flex-col group">
                        <div className="p-6 flex-grow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                    <Globe size={24} />
                                </div>
                                <Badge variant={tour.featured ? 'success' : 'accent'}>
                                    {tour.featured ? 'Featured' : 'Active'}
                                </Badge>
                            </div>

                            <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">{tour.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <MapPin size={14} />
                                {tour.destination}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock size={16} />
                                        <span>Duration</span>
                                    </div>
                                    <span className="font-semibold">{durationText}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users size={16} />
                                        <span>Capacity</span>
                                    </div>
                                    <span className="font-semibold">
                                        {tour.minGuests ? `${tour.minGuests}-${tour.maxGuests || tour.groupSize}` : `${tour.groupSize}`} People
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Activity size={16} />
                                        <span>Price</span>
                                    </div>
                                    <span className="font-bold text-primary">${tour.basePrice || tour.price}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <span>Pricing</span>
                                    </div>
                                    <span className="font-semibold">{tour.pricingType}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <span>Deposit/Cutoff</span>
                                    </div>
                                    <span className="font-semibold">{tour.depositPercent ?? 20}% · {tour.bookingCutoffHours ?? 24}h</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-surface-dark/20 border-t border-surface-border flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-[10px] h-8 uppercase font-bold tracking-wider"
                                onClick={() => setDetailTour(tour)}
                            >
                                <Eye size={14} />
                                Full Details
                            </Button>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => handleEdit(tour)}>
                                    <Edit size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-error hover:bg-error/10" onClick={() => handleDelete(tour._id)}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>

            {!isLoading && toursData?.data.length === 0 && (
                <div className="bg-surface-light border border-dashed border-surface-border rounded-2xl p-12 text-center">
                    <p className="text-muted-foreground">No tours found. Create your first tour to get started.</p>
                    <Button onClick={handleCreate} className="mt-4" variant="outline">+ Add Your First Tour</Button>
                </div>
            )}
        </div>
    );
}

function TourDetailsModal({
    tour,
    onClose,
    postLoginAction,
    onPostLoginActionConsumed,
}: {
    tour: Tour;
    onClose: () => void;
    postLoginAction?: any;
    onPostLoginActionConsumed?: () => void;
}) {
    const itineraryPreview = (tour.itinerary || []).slice(0, 8);
    const [selectedDepartureId, setSelectedDepartureId] = useState<string>('');
    const { data: options } = useQuery({
        queryKey: ['admin', 'tour-departure-options', tour._id],
        queryFn: () => bookingsApi.getTourOptions(tour._id),
        enabled: Boolean(tour._id),
    });
    useEffect(() => {
        if (!selectedDepartureId && options?.departures?.length) {
            setSelectedDepartureId(options.departures[0]._id);
        }
    }, [options, selectedDepartureId]);
    useEffect(() => {
        if (
            postLoginAction?.action === 'assign_staff' &&
            postLoginAction?.departureId &&
            options?.departures?.some((d) => d._id === postLoginAction.departureId)
        ) {
            setSelectedDepartureId(postLoginAction.departureId);
            onPostLoginActionConsumed?.();
        }
    }, [postLoginAction, options, onPostLoginActionConsumed]);
    return (
        <div className="fixed inset-0 z-[150] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-surface-border bg-surface-light shadow-2xl">
                <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white">{tour.title}</h3>
                        <p className="text-sm text-neutral-400">{tour.destination}</p>
                    </div>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Metric label="Duration" value={`${tour.duration} days${tour.durationDetails?.nights != null ? ` / ${tour.durationDetails.nights} nights` : ''}`} />
                        <Metric label="Guests" value={tour.minGuests ? `${tour.minGuests}-${tour.maxGuests || tour.groupSize}` : `${tour.groupSize}`} />
                        <Metric label="Pricing" value={`${tour.pricingType || 'per_person'} · $${tour.basePrice || tour.price}`} />
                        <Metric label="Deposit" value={`${tour.depositPercent ?? 20}%`} />
                        <Metric label="Cutoff" value={`${tour.bookingCutoffHours ?? 24}h`} />
                        <Metric label="Add-ons" value={`${tour.addons?.length || 0}`} />
                    </div>

                    {!!tour.description && (
                        <section className="rounded-xl border border-surface-border bg-surface-dark/30 p-4">
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-neutral-300 whitespace-pre-line">{tour.description}</p>
                        </section>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <section className="rounded-xl border border-surface-border bg-surface-dark/30 p-4">
                            <h4 className="font-semibold mb-2">Included</h4>
                            <ul className="text-sm text-neutral-300 space-y-1">
                                {(tour.included || []).map((line, idx) => <li key={idx}>- {line}</li>)}
                                {!tour.included?.length && <li>No inclusions listed.</li>}
                            </ul>
                        </section>
                        <section className="rounded-xl border border-surface-border bg-surface-dark/30 p-4">
                            <h4 className="font-semibold mb-2">Excluded</h4>
                            <ul className="text-sm text-neutral-300 space-y-1">
                                {(tour.excluded || []).map((line, idx) => <li key={idx}>- {line}</li>)}
                                {!tour.excluded?.length && <li>No exclusions listed.</li>}
                            </ul>
                        </section>
                    </div>

                    <section className="rounded-xl border border-surface-border bg-surface-dark/30 p-4">
                        <h4 className="font-semibold mb-2">Add-ons</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {(tour.addons || []).map((addon, idx) => (
                                <div key={idx} className="rounded-lg border border-surface-border px-3 py-2 text-sm flex items-center justify-between">
                                    <span>{addon.name}</span>
                                    <span className="text-primary font-semibold">${addon.price}</span>
                                </div>
                            ))}
                            {!tour.addons?.length && <p className="text-sm text-neutral-400">No add-ons configured.</p>}
                        </div>
                    </section>

                    <section className="rounded-xl border border-surface-border bg-surface-dark/30 p-4">
                        <h4 className="font-semibold mb-2">Itinerary Preview</h4>
                        <div className="space-y-2">
                            {itineraryPreview.map((day: any, idx) => (
                                <div key={idx} className="rounded-lg border border-surface-border px-3 py-2">
                                    <p className="text-sm font-semibold text-white">
                                        Day {day.day || idx + 1}: {day.title || 'Untitled'}
                                    </p>
                                    {!!day.description && (
                                        <p className="text-xs text-neutral-400 mt-1 line-clamp-3">{day.description}</p>
                                    )}
                                </div>
                            ))}
                            {!itineraryPreview.length && <p className="text-sm text-neutral-400">No itinerary configured.</p>}
                        </div>
                    </section>
                    <section className="rounded-xl border border-surface-border bg-surface-dark/30 p-4 space-y-3">
                        <h4 className="font-semibold">Operational Assignments</h4>
                        {options?.departures?.length ? (
                            <>
                                <div className="flex flex-wrap gap-2">
                                    {options.departures.map((d) => (
                                        <Button
                                            key={d._id}
                                            size="sm"
                                            variant={selectedDepartureId === d._id ? 'primary' : 'outline'}
                                            onClick={() => setSelectedDepartureId(d._id)}
                                        >
                                            {new Date(d.startsAt).toLocaleDateString()}
                                        </Button>
                                    ))}
                                </div>
                                {selectedDepartureId ? (
                                    <DepartureAssignmentPanel departureId={selectedDepartureId} />
                                ) : null}
                            </>
                        ) : (
                            <p className="text-sm text-neutral-400">No departures found for this package yet.</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-surface-border bg-surface-dark/30 p-3">
            <p className="text-xs uppercase text-neutral-500">{label}</p>
            <p className="text-base font-semibold text-white mt-1">{value}</p>
        </div>
    );
}
