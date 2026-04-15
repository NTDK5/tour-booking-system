import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X, Car, Users, Settings,
    Calendar, MessageSquare, Send,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateBooking } from '@/hooks/useBookings';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface RequestCarModalProps {
    onClose: () => void;
}

export default function RequestCarModal({ onClose }: RequestCarModalProps) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { mutate: createBooking, isPending } = useCreateBooking();
    const [formData, setFormData] = useState({
        carType: '',
        passengerCapacity: 1,
        transmission: 'any' as 'automatic' | 'manual' | 'any',
        checkInDate: '',
        checkOutDate: '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please sign in to submit a custom car request.');
            onClose();
            navigate('/login');
            return;
        }
        createBooking({
            bookingType: 'car',
            customCarRequest: {
                ...formData,
                passengerCapacity: Number(formData.passengerCapacity),
                checkInDate: formData.checkInDate as any,
                checkOutDate: formData.checkOutDate as any,
            },
            totalPrice: 0,
            numberOfPeople: Number(formData.passengerCapacity),
            paymentMethod: 'cash',
            isRequest: true
        }, {
            onSuccess: () => onClose()
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-surface/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-2xl bg-surface-light rounded-[40px] border border-surface-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-surface-border flex justify-between items-center bg-surface-dark/20">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3 italic">
                            Request <span className="text-primary tracking-widest">Custom Car</span>
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">Tell us exactly what you need and we'll find it for you.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-full bg-surface border border-surface-border flex items-center justify-center text-neutral-400 hover:text-white hover:border-primary transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Car Type */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Car size={14} className="text-primary" /> Preferred Car Type
                            </label>
                            <select
                                required
                                value={formData.carType}
                                onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
                                className="w-full h-14 bg-surface border border-surface-border rounded-2xl px-4 text-white outline-none focus:border-primary transition-all"
                            >
                                <option value="">Select Type</option>
                                <option value="SUV">SUV / 4x4</option>
                                <option value="Minibus">Minibus / Van</option>
                                <option value="Luxury">Luxury Sedan</option>
                                <option value="Pickup">Pickup Truck</option>
                                <option value="Other">Other / Specialty</option>
                            </select>
                        </div>

                        {/* Capacity */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Users size={14} className="text-primary" /> Passengers
                            </label>
                            <Input
                                type="number"
                                min={1}
                                required
                                value={formData.passengerCapacity}
                                onChange={(e) => setFormData({ ...formData, passengerCapacity: Number(e.target.value) })}
                                placeholder="Number of seats"
                            />
                        </div>

                        {/* Transmission */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Settings size={14} className="text-primary" /> Transmission
                            </label>
                            <div className="flex gap-2">
                                {['any', 'automatic', 'manual'].map((tx) => (
                                    <button
                                        key={tx}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, transmission: tx as any })}
                                        className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${formData.transmission === tx
                                                ? 'bg-primary border-primary text-white'
                                                : 'bg-surface border-surface-border text-neutral-500 hover:border-primary/50'
                                            }`}
                                    >
                                        {tx}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dates Wrapper */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                    <Calendar size={14} className="text-primary" /> From
                                </label>
                                <Input
                                    type="date"
                                    required
                                    value={formData.checkInDate}
                                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                    To
                                </label>
                                <Input
                                    type="date"
                                    required
                                    value={formData.checkOutDate}
                                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-4 mb-8">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2 flex items-center gap-2">
                            <MessageSquare size={14} className="text-primary" /> Trip Details & Route
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Describe your planned route, terrain, or any specific requirements like driver needed, child seats, etc."
                            className="w-full h-32 bg-surface border border-surface-border rounded-3xl p-6 text-sm text-white outline-none focus:border-primary transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 p-6 rounded-3xl bg-primary/5 border border-primary/20 mb-8">
                        <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            Custom requests do not guarantee immediate availability. Our logistics team will review your needs and send a price offer within 24 hours.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 h-16 rounded-2xl font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-[2] h-16 rounded-2xl font-bold text-lg italic"
                            isLoading={isPending}
                        >
                            Submit Request <Send className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
