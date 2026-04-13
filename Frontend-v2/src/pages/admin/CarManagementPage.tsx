import { useState } from 'react';
import {
    Car as CarIcon,
    Plus,
    Edit,
    Trash2,
    Users,
    Gauge,
    ShieldCheck,
    Calendar,
    CheckCircle,
    Settings,
    AlertCircle,
    Fuel,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCars, useCreateCar, useUpdateCar, useDeleteCar } from '@/hooks/useCars';
import { Skeleton } from '@/components/ui/Skeleton';
import { CarFormModal } from '@/features/admin/CarFormModal';
import type { Car } from '@/types';

export default function CarManagementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);

    const { data: cars, isLoading, error } = useCars();
    const createCar = useCreateCar();
    const updateCar = useUpdateCar();
    const deleteCar = useDeleteCar();

    const handleEdit = (car: Car) => {
        setSelectedCar(car);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCar(null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Partial<Car>) => {
        if (selectedCar) {
            await updateCar.mutateAsync({ id: selectedCar._id, payload: data });
        } else {
            await createCar.mutateAsync(data);
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this vehicle from the fleet?')) {
            await deleteCar.mutateAsync(id);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-light rounded-2xl border border-surface-border">
                <AlertCircle size={48} className="text-error mb-4" />
                <h3 className="text-xl font-bold">Failed to load fleet data</h3>
                <p className="text-muted-foreground mt-2">There was an error connecting to the server.</p>
                <Button onClick={() => window.location.reload()} className="mt-6">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Fleet Management</h2>
                    <p className="text-muted-foreground">Manage car rentals, drivers, and vehicle maintenance status.</p>
                </div>
                <Button className="gap-2" onClick={handleCreate}>
                    <Plus size={18} />
                    Add Vehicle
                </Button>
            </div>

            {isModalOpen && (
                <CarFormModal
                    car={selectedCar}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    isLoading={createCar.isPending || updateCar.isPending}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[250px] rounded-2xl" />)
                ) : cars?.map((car) => (
                    <div key={car._id} className="bg-surface-light border border-surface-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-primary/50 flex flex-col md:flex-row group">
                        <div className="md:w-1/3 bg-surface-dark/40 flex items-center justify-center p-8 border-r border-surface-border relative overflow-hidden">
                            <CarIcon size={64} className="text-muted-foreground opacity-20 group-hover:scale-110 group-hover:text-primary transition-all duration-500" />
                            <div className="absolute top-4 left-4">
                                <Badge variant={car.available ? 'success' : 'destructive'} className="uppercase text-[9px] font-black">
                                    {car.available ? 'Ready' : 'In Use'}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex-1 p-6 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{car.brand} {car.model}</h3>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Year: {car.year}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-white">${car.pricePerDay}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Per Day</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm mb-6 mt-2">
                                <div className="flex items-center gap-2 text-neutral-400 font-medium">
                                    <ShieldCheck size={16} className="text-primary/60" />
                                    <span className="text-xs">{car.plateNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-400 font-medium">
                                    <Users size={16} className="text-primary/60" />
                                    <span className="text-xs">{car.capacity} Seats</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-400 font-medium">
                                    <Fuel size={16} className="text-primary/60" />
                                    <span className="text-xs capitalize">{car.fuelType}</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-400 font-medium">
                                    <Gauge size={16} className="text-primary/60" />
                                    <span className="text-xs capitalize">{car.transmission}</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-surface-border flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold">Schedule</Button>
                                    <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold">Logs</Button>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => handleEdit(car)}>
                                        <Settings size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-error hover:bg-error/10" onClick={() => handleDelete(car._id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!isLoading && cars?.length === 0 && (
                <div className="bg-surface-light border border-dashed border-surface-border rounded-2xl p-12 text-center">
                    <p className="text-muted-foreground">No vehicles found in the fleet.</p>
                    <Button onClick={handleCreate} className="mt-4" variant="outline">+ Add Your First Vehicle</Button>
                </div>
            )}
        </div>
    );
}
