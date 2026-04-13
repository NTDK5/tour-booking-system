import { useState, useEffect } from 'react';
import { X, Save, Car as CarIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Car } from '@/types';

interface CarFormModalProps {
    car?: Car | null;
    onClose: () => void;
    onSave: (data: Partial<Car>) => void;
    isLoading?: boolean;
}

export function CarFormModal({ car, onClose, onSave, isLoading }: CarFormModalProps) {
    const [formData, setFormData] = useState<Partial<Car>>({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        plateNumber: '',
        pricePerDay: 0,
        capacity: 5,
        transmission: 'manual',
        fuelType: 'diesel',
        available: true,
        features: [],
    });

    useEffect(() => {
        if (car) {
            setFormData(car);
        }
    }, [car]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-surface-light border border-surface-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-surface-border flex items-center justify-between bg-surface-dark/20">
                    <h3 className="text-xl font-bold">{car ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-surface-dark rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Brand</label>
                            <Input
                                required
                                value={formData.brand}
                                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                placeholder="e.g. Toyota"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Model</label>
                            <Input
                                required
                                value={formData.model}
                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                                placeholder="e.g. Land Cruiser"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Year</label>
                            <Input
                                type="number"
                                required
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Plate Number</label>
                            <Input
                                required
                                value={formData.plateNumber}
                                onChange={e => setFormData({ ...formData, plateNumber: e.target.value })}
                                placeholder="e.g. AA 2 B 12345"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Price per Day ($)</label>
                            <Input
                                type="number"
                                required
                                value={formData.pricePerDay}
                                onChange={e => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Capacity</label>
                            <Input
                                type="number"
                                value={formData.capacity}
                                onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Transmission</label>
                            <select
                                className="w-full h-11 px-4 rounded-xl bg-surface-dark border border-surface-border outline-none"
                                value={formData.transmission}
                                onChange={e => setFormData({ ...formData, transmission: e.target.value as any })}
                            >
                                <option value="manual">Manual</option>
                                <option value="automatic">Automatic</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Fuel Type</label>
                            <select
                                className="w-full h-11 px-4 rounded-xl bg-surface-dark border border-surface-border outline-none"
                                value={formData.fuelType}
                                onChange={e => setFormData({ ...formData, fuelType: e.target.value as any })}
                            >
                                <option value="diesel">Diesel</option>
                                <option value="petrol">Petrol</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-surface-border bg-surface-dark text-primary"
                                checked={formData.available}
                                onChange={e => setFormData({ ...formData, available: e.target.checked })}
                            />
                            <span className="text-sm font-bold uppercase tracking-wider">Available for Booking</span>
                        </label>
                    </div>
                </form>

                <div className="p-6 border-t border-surface-border bg-surface-dark/20 flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                    <Button
                        className="gap-2"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                {car ? 'Update Vehicle' : 'Add Vehicle'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
