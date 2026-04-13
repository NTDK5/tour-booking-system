import { useState } from 'react';
import {
    Hotel,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    AlertCircle,
    MapPin,
    DollarSign,
    Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLodges, useCreateLodge, useUpdateLodge, useDeleteLodge } from '@/hooks/useLodges';
import { Skeleton } from '@/components/ui/Skeleton';
import { LodgeFormModal } from '@/features/admin/LodgeFormModal';
import type { Lodge } from '@/types';

export default function LodgeManagementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLodge, setSelectedLodge] = useState<Lodge | null>(null);

    const { data: lodgesData, isLoading, error } = useLodges();
    const createLodge = useCreateLodge();
    const updateLodge = useUpdateLodge();
    const deleteLodge = useDeleteLodge();

    const handleEdit = (lodge: Lodge) => {
        setSelectedLodge(lodge);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedLodge(null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Partial<Lodge>) => {
        if (selectedLodge) {
            await updateLodge.mutateAsync({ id: selectedLodge._id, payload: data });
        } else {
            await createLodge.mutateAsync(data);
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            await deleteLodge.mutateAsync(id);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-light rounded-2xl border border-surface-border">
                <AlertCircle size={48} className="text-error mb-4" />
                <h3 className="text-xl font-bold">Failed to load lodges</h3>
                <p className="text-muted-foreground mt-2">There was an error connecting to the server.</p>
                <Button onClick={() => window.location.reload()} className="mt-6">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Lodge Inventory</h2>
                    <p className="text-muted-foreground">Manage lodge properties, room types, and base availability.</p>
                </div>
                <Button className="gap-2" onClick={handleCreate}>
                    <Plus size={18} />
                    Add Property
                </Button>
            </div>

            {isModalOpen && (
                <LodgeFormModal
                    lodge={selectedLodge}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    isLoading={createLodge.isPending || updateLodge.isPending}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <Skeleton key={i} className="h-[350px] rounded-2xl" />)
                ) : lodgesData?.data.map((lodge) => (
                    <div key={lodge._id} className="bg-surface-light border border-surface-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-primary/50 group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                        <Hotel size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{lodge.name}</h3>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <MapPin size={14} />
                                            {lodge.location}
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={lodge.featured ? 'success' : 'accent'} className="gap-1 px-2">
                                    {lodge.featured ? <Star size={10} fill="currentColor" /> : <CheckCircle size={10} />}
                                    {lodge.featured ? 'Featured' : 'Active'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-surface-dark/40 rounded-2xl border border-surface-border/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Base Price</p>
                                    <p className="text-xl font-black text-white">${lodge.pricePerNight}<span className="text-xs text-muted-foreground font-normal">/nt</span></p>
                                </div>
                                <div className="p-4 bg-surface-dark/40 rounded-2xl border border-surface-border/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Room Types</p>
                                    <p className="text-xl font-black text-white">{lodge.roomTypes?.length || 0}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] text-primary uppercase font-black tracking-widest mb-2">Highlights</p>
                                {lodge.amenities?.slice(0, 3).map((amenity, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                        {amenity}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-surface-dark/20 border-t border-surface-border flex items-center justify-between">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-wider">Rooms</Button>
                                <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-wider">Calendar</Button>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => handleEdit(lodge)}>
                                    <Edit size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-error hover:bg-error/10" onClick={() => handleDelete(lodge._id)}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!isLoading && lodgesData?.data.length === 0 && (
                <div className="bg-surface-light border border-dashed border-surface-border rounded-2xl p-12 text-center">
                    <p className="text-muted-foreground">No properties found. Add your first lodge to get started.</p>
                    <Button onClick={handleCreate} className="mt-4" variant="outline">+ Add Property</Button>
                </div>
            )}
        </div>
    );
}
