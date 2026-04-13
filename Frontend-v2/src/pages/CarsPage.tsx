import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, Fuel, Settings, Users,
    MapPin, Calendar, Clock, ChevronRight,
    ShieldCheck, Phone, LayoutGrid, SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus } from 'lucide-react';
import carouselHero from '@/assets/images/carousel-2.jpg';

import { useCars } from '@/hooks/useCars';
import { useCreateBooking } from '@/hooks/useBookings';
import RequestCarModal from '@/components/custom/RequestCarModal';
import { resolveImageUrl } from '@/utils/url';

export default function CarsPage() {
    const { data: cars = [], isLoading, isError, refetch } = useCars();
    const normalizedCars = cars.map((car: any) => ({
        ...car,
        model: car.model || car.carModel || car.name || 'Car',
        capacity: car.capacity || car.seats || 1,
        transmission: (car.transmission || '').toLowerCase(),
        fuelType: (car.fuelType || '').toLowerCase(),
        images: Array.isArray(car.images) ? car.images.map((img: string) => resolveImageUrl(img)) : [],
    }));
    const [selectedCar, setSelectedCar] = useState<any | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [filters, setFilters] = useState({ transmission: 'all', fuelType: 'all' });
    const [bookingData, setBookingData] = useState({
        pickupLocation: '',
        checkInDate: '',
        checkOutDate: '',
        notes: '',
        isRequest: false
    });
    const { mutate: createBooking, isPending: isBooking } = useCreateBooking();

    const handleBooking = () => {
        if (!selectedCar) return;
        createBooking({
            bookingType: 'car',
            carId: selectedCar._id,
            checkInDate: bookingData.checkInDate,
            checkOutDate: bookingData.checkOutDate,
            pickupLocation: bookingData.pickupLocation,
            notes: bookingData.notes,
            isRequest: bookingData.isRequest,
            totalPrice: selectedCar.pricePerDay, // Backend will recalculate or ignore for request
            numberOfPeople: selectedCar.capacity,
            paymentMethod: 'cash'
        });
    };

    const filteredCars = normalizedCars.filter((car: any) => {
        return (filters.transmission === 'all' || car.transmission === filters.transmission) &&
            (filters.fuelType === 'all' || car.fuelType === filters.fuelType);
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            {/* Hero Banner */}
            <section className="relative h-[50vh] flex items-end overflow-hidden">
                <img
                    src={carouselHero}
                    alt="Premium fleet"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                <div className="relative z-10 section-container pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl"
                    >
                        <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Our Fleet</p>
                        <h1 className="text-5xl md:text-7xl font-bold text-white italic">Premium <span className="text-primary italic-none tracking-widest">Fleet</span></h1>
                    </motion.div>
                </div>
            </section>

            <div className="section-container py-16">
                {/* Filter Header */}
                <header className="mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-2xl">
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-neutral-400 text-lg md:text-xl font-light leading-relaxed"
                            >
                                Explore Ethiopia's diverse terrain with our meticulously maintained fleet. From city cruisers to rugged 4x4s, we have the perfect vehicle for your adventure.
                            </motion.p>
                        </div>

                        <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap gap-4 p-2 bg-surface-light rounded-2xl border border-surface-border w-full md:w-auto">
                            <select
                                className="bg-transparent text-sm font-bold text-white px-4 py-2 outline-none cursor-pointer w-full sm:w-auto"
                                onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                            >
                                <option value="all">Transmission</option>
                                <option value="automatic">Automatic</option>
                                <option value="manual">Manual</option>
                            </select>
                            <div className="hidden sm:block w-[1px] bg-surface-border"></div>
                            <div className="sm:hidden h-[1px] w-full bg-surface-border my-1"></div>
                            <select
                                className="bg-transparent text-sm font-bold text-white px-4 py-2 outline-none cursor-pointer w-full sm:w-auto"
                                onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                            >
                                <option value="all">Fuel Type</option>
                                <option value="diesel">Diesel</option>
                                <option value="petrol">Petrol</option>
                            </select>
                        </div>
                    </div>
                </header>

                {/* Car Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredCars.map((car: any) => (
                            <motion.div
                                key={car._id}
                                layout
                                onClick={() => setSelectedCar(car)}
                                className={`group relative overflow-hidden rounded-[32px] border transition-all duration-300 cursor-pointer shadow-xl ${selectedCar?._id === car._id
                                    ? 'border-primary ring-1 ring-primary/50 bg-primary/5'
                                    : 'border-surface-border bg-surface-light hover:border-primary/30'
                                    }`}
                            >
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img
                                        src={car.images?.[0] || 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=800'}
                                        alt={`${car.brand} ${car.model}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {!car.available && (
                                        <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center p-8 text-center ring-inset ring-1 ring-red-500/20">
                                            <div className="space-y-2">
                                                <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20 uppercase tracking-widest text-[10px]">Fully Booked</Badge>
                                                <p className="text-white font-bold">Currently Unavailable</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">{car.brand}</div>
                                            <h3 className="text-2xl font-bold text-white">{car.model}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-primary italic">${car.pricePerDay}</div>
                                            <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">per day</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 text-neutral-400">
                                            <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center">
                                                <Settings className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-xs font-medium capitalize">{car.transmission}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-neutral-400">
                                            <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center">
                                                <Fuel className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-xs font-medium capitalize">{car.fuelType}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-neutral-400">
                                            <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center">
                                                <Users className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-xs font-medium">{car.capacity} Seats</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-neutral-400">
                                            <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center">
                                                <Calendar className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-xs font-medium">{car.year}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <motion.div
                            layout
                            onClick={() => setIsRequestModalOpen(true)}
                            className="group relative overflow-hidden rounded-[32px] border border-dashed border-primary/30 bg-primary/5 hover:border-primary transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-12 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Can't find what you need?</h3>
                            <p className="text-neutral-400 text-sm">Request a custom vehicle tailored to your specific travel needs across Ethiopia.</p>
                        </motion.div>
                    </div>

                    {/* Sidebar - Booking Preview */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-32 card bg-surface-light p-10 border-surface-border shadow-2xl overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>

                            <h3 className="text-2xl font-bold text-white mb-8 italic">Your <span className="text-primary tracking-widest">Inquiry</span></h3>

                            <AnimatePresence mode="wait">
                                {selectedCar ? (
                                    <motion.div
                                        key="selected"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="p-6 rounded-[24px] bg-surface border border-surface-border">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img src={selectedCar.images?.[0] || 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=400'} className="w-16 h-16 rounded-xl object-cover border border-surface-border" />
                                                <div>
                                                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{selectedCar.brand}</div>
                                                    <div className="text-white font-bold">{selectedCar.model}</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-surface-border">
                                                <span className="text-xs text-neutral-500 font-bold uppercase">Base Price</span>
                                                <span className="text-primary font-black">${selectedCar.pricePerDay}/day</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest px-2">Pickup Location</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                    <input
                                                        placeholder="Addis Ababa Airport..."
                                                        value={bookingData.pickupLocation}
                                                        onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                                                        className="w-full h-14 bg-surface border border-surface-border rounded-2xl pl-12 pr-4 text-sm text-white outline-none focus:border-primary transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest px-2">From</label>
                                                    <input
                                                        type="date"
                                                        value={bookingData.checkInDate}
                                                        onChange={(e) => setBookingData({ ...bookingData, checkInDate: e.target.value })}
                                                        className="w-full h-14 bg-surface border border-surface-border rounded-2xl px-4 text-xs text-white outline-none focus:border-primary transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest px-2">To</label>
                                                    <input
                                                        type="date"
                                                        value={bookingData.checkOutDate}
                                                        onChange={(e) => setBookingData({ ...bookingData, checkOutDate: e.target.value })}
                                                        className="w-full h-14 bg-surface border border-surface-border rounded-2xl px-4 text-xs text-white outline-none focus:border-primary transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest px-2">Special Requirements</label>
                                                <textarea
                                                    placeholder="Driver needed, child seat, etc..."
                                                    value={bookingData.notes}
                                                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                                    className="w-full h-24 bg-surface border border-surface-border rounded-2xl p-4 text-sm text-white outline-none focus:border-primary transition-all resize-none"
                                                />
                                            </div>

                                            <div
                                                onClick={() => setBookingData({ ...bookingData, isRequest: !bookingData.isRequest })}
                                                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${bookingData.isRequest ? 'border-primary bg-primary/10' : 'border-surface-border bg-surface'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Clock className={`w-4 h-4 ${bookingData.isRequest ? 'text-primary' : 'text-neutral-500'}`} />
                                                    <div>
                                                        <div className="text-xs font-bold text-white">Need a custom quote?</div>
                                                        <div className="text-[10px] text-neutral-500">Request for long-term or specific tours</div>
                                                    </div>
                                                </div>
                                                <div className={`w-10 h-6 rounded-full relative transition-all ${bookingData.isRequest ? 'bg-primary' : 'bg-neutral-800'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${bookingData.isRequest ? 'right-1' : 'left-1'}`} />
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant={bookingData.isRequest ? 'primary' : 'accent'}
                                            className="w-full h-16 rounded-[24px] text-lg font-bold"
                                            onClick={handleBooking}
                                            isLoading={isBooking}
                                        >
                                            {bookingData.isRequest ? 'Request For Quote' : 'Confirm Reservation'}
                                            <ChevronRight className="ml-2 w-5 h-5" />
                                        </Button>

                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                                            <ShieldCheck className="w-5 h-5 text-primary" />
                                            <p className="text-[10px] text-neutral-400 leading-tight">
                                                {bookingData.isRequest
                                                    ? "Your request will be reviewed by our admin team who will propose a final price within 24 hours."
                                                    : "Price includes basic insurance and 24/7 roadside assistance across Ethiopia."}
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-20 text-center space-y-6"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-surface border border-dashed border-surface-border flex items-center justify-center mx-auto text-neutral-600">
                                            <Car className="w-8 h-8" />
                                        </div>
                                        <p className="text-neutral-500 text-sm max-w-[200px] mx-auto">Select a vehicle from our fleet to start your reservation.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Trust Badges */}
            <section className="mt-32 py-24 border-t border-surface-border">
                <div className="section-container">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="flex gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-surface-light border border-surface-border flex items-center justify-center flex-shrink-0">
                                <Phone className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-2">24/7 Roadside Assistance</h4>
                                <p className="text-sm text-neutral-500 leading-relaxed">Dedicated support team available around the clock wherever you are in Ethiopia.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-surface-light border border-surface-border flex items-center justify-center flex-shrink-0">
                                <LayoutGrid className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-2">Flexible Fleet Options</h4>
                                <p className="text-sm text-neutral-500 leading-relaxed">Choose from economy sedans to rugged off-road vehicles for any terrain.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-surface-light border border-surface-border flex items-center justify-center flex-shrink-0">
                                <SlidersHorizontal className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-2">Transparent Pricing</h4>
                                <p className="text-sm text-neutral-500 leading-relaxed">No hidden fees. Inclusive insurance and unlimited kilometers available on select models.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <AnimatePresence>
                {isRequestModalOpen && (
                    <RequestCarModal onClose={() => setIsRequestModalOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
