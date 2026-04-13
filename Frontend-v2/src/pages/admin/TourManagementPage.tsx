import { useState } from 'react';
import {
    Globe,
    Plus,
    Edit,
    Trash2,
    Users,
    Clock,
    MapPin,
    Calendar,
    Activity,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTours, useCreateTour, useUpdateTour, useDeleteTour } from '@/hooks/useTours';
import { Skeleton } from '@/components/ui/Skeleton';
import { TourFormModal } from '@/features/admin/TourFormModal';
import type { Tour } from '@/types';

export default function TourManagementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

    const { data: toursData, isLoading, error } = useTours();
    const createTour = useCreateTour();
    const updateTour = useUpdateTour();
    const deleteTour = useDeleteTour();

    const handleEdit = (tour: Tour) => {
        setSelectedTour(tour);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedTour(null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Partial<Tour>) => {
        if (selectedTour) {
            await updateTour.mutateAsync({ id: selectedTour._id, payload: data });
        } else {
            await createTour.mutateAsync(data);
        }
        setIsModalOpen(false);
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
                <TourFormModal
                    tour={selectedTour}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    isLoading={createTour.isPending || updateTour.isPending}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <Skeleton key={i} className="h-[300px] rounded-2xl" />)
                ) : toursData?.data.map((tour) => (
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
                                    <span className="font-semibold">{tour.duration} Days</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users size={16} />
                                        <span>Capacity</span>
                                    </div>
                                    <span className="font-semibold">{tour.groupSize} People</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Activity size={16} />
                                        <span>Price</span>
                                    </div>
                                    <span className="font-bold text-primary">${tour.price}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-surface-dark/20 border-t border-surface-border flex items-center justify-between">
                            <Button variant="outline" size="sm" className="gap-2 text-[10px] h-8 uppercase font-bold tracking-wider">
                                <Calendar size={14} />
                                Itinerary
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
                ))}
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
