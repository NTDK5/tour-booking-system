import { useState, useEffect } from 'react';
import { X, Save, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Lodge } from '@/types';

interface LodgeFormModalProps {
    lodge?: Lodge | null;
    onClose: () => void;
    onSave: (data: Partial<Lodge>) => void;
    isLoading?: boolean;
}

export function LodgeFormModal({ lodge, onClose, onSave, isLoading }: LodgeFormModalProps) {
    const [formData, setFormData] = useState<Partial<Lodge>>({
        name: '',
        description: '',
        location: '',
        pricePerNight: 0,
        amenities: [],
        featured: false,
    });

    useEffect(() => {
        if (lodge) {
            setFormData(lodge);
        }
    }, [lodge]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-surface-light border border-surface-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-surface-border flex items-center justify-between bg-surface-dark/20">
                    <h3 className="text-xl font-bold">{lodge ? 'Edit Property' : 'Add New Property'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-surface-dark rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Property Name</label>
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Guge Lodge"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Location</label>
                            <Input
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Chencha"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Price per Night ($)</label>
                            <Input
                                type="number"
                                required
                                value={formData.pricePerNight}
                                onChange={e => setFormData({ ...formData, pricePerNight: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="flex items-center h-full pt-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-surface-border bg-surface-dark text-primary"
                                    checked={formData.featured}
                                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                />
                                <span className="text-sm font-bold uppercase tracking-wider">Featured Property</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                        <textarea
                            className="w-full p-4 rounded-xl bg-surface-dark border border-surface-border outline-none min-h-[100px]"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the lodge, its vibe, and surroundings..."
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
                                {lodge ? 'Update Property' : 'Add Property'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
