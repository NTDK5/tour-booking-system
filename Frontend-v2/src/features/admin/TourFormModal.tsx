import { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Tour } from '@/types';

interface TourFormModalProps {
    tour?: Tour | null;
    onClose: () => void;
    onSave: (data: Partial<Tour>) => void;
    isLoading?: boolean;
}

export function TourFormModal({ tour, onClose, onSave, isLoading }: TourFormModalProps) {
    const [formData, setFormData] = useState<Partial<Tour>>({
        title: '',
        description: '',
        destination: '',
        duration: 1,
        groupSize: 10,
        price: 0,
        difficulty: 'moderate',
        tourType: 'cultural',
        highlights: [],
        included: [],
        excluded: [],
    });

    useEffect(() => {
        if (tour) {
            setFormData(tour);
        }
    }, [tour]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-surface-light border border-surface-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-surface-border flex items-center justify-between bg-surface-dark/20">
                    <h3 className="text-xl font-bold">{tour ? 'Edit Tour' : 'Create New Tour'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-surface-dark rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Tour Title</label>
                            <Input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Abuna Yosef Trek"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Destination</label>
                            <Input
                                required
                                value={formData.destination}
                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                placeholder="e.g. Lalibela"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Duration (Days)</label>
                            <Input
                                type="number"
                                required
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Price ($)</label>
                            <Input
                                type="number"
                                required
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Max Group Size</label>
                            <Input
                                type="number"
                                value={formData.groupSize}
                                onChange={e => setFormData({ ...formData, groupSize: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Difficulty</label>
                            <select
                                className="w-full h-11 px-4 rounded-xl bg-surface-dark border border-surface-border outline-none text-white"
                                value={formData.difficulty}
                                onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                            >
                                <option value="easy">Easy</option>
                                <option value="moderate">Moderate</option>
                                <option value="challenging">Challenging</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                        <textarea
                            className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[100px] text-white placeholder:text-neutral-500"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed tour itinerary and information..."
                        />
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
                                {tour ? 'Update Tour' : 'Create Tour'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
