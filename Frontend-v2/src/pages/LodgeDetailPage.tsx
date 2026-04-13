import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Star, ShieldCheck,
    Wifi, Coffee, Car, Utensils,
    ChevronRight, ArrowLeft, Share2, Heart,
    Info, CheckCircle2, Award, Zap
} from 'lucide-react';
import { useLodge } from '@/hooks/useLodges';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { AvailabilityCalendar } from '@/components/lodges/AvailabilityCalendar';
import { useState } from 'react';
import { format } from 'date-fns';

export default function LodgeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedDates, setSelectedDates] = useState<{ in: Date, out: Date } | null>(null);

    // Use a fallback ID if none is provided, or if we want to force "Dorze Lodge"
    const lodgeId = id || '66f580b0768351ca74219746';
    const { data: lodge, isLoading, isError, refetch } = useLodge(lodgeId);

    if (isLoading) return <LodgeDetailSkeleton />;
    if (isError || !lodge) return <ErrorState onRetry={() => refetch()} />;

    const amenityIcons: Record<string, any> = {
        Wifi: Wifi,
        Breakfast: Coffee,
        Parking: Car,
        Restaurant: Utensils,
    };

    return (
        <div className="min-h-screen bg-surface pb-32">
            {/* Premium Hero Gallery */}
            <section className="relative h-[75vh] md:h-[85vh] overflow-hidden group">
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-surface"></div>

                <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-3 p-4">
                    <div className="col-span-4 lg:col-span-2 row-span-2 relative overflow-hidden rounded-[40px] shadow-2xl">
                        <img
                            src={lodge.images[0]}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            alt={lodge.name}
                        />
                        <div className="absolute bottom-12 left-12 z-20 hidden lg:block">
                            <Badge variant="accent" className="mb-4 h-8 px-4 text-xs font-bold uppercase tracking-widest bg-primary/20 backdrop-blur-md border border-primary/30">Masterpiece Collection</Badge>
                            <h1 className="text-5xl font-bold text-white mb-2 italic">{lodge.name}</h1>
                            <div className="flex items-center gap-2 text-neutral-300">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span className="font-medium tracking-wide">{lodge.location}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block lg:col-span-1 lg:row-span-1 relative overflow-hidden rounded-[32px] shadow-xl">
                        <img src={lodge.images[1] || lodge.images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt={lodge.name} />
                    </div>
                    <div className="hidden lg:block lg:col-span-1 lg:row-span-1 relative overflow-hidden rounded-[32px] shadow-xl">
                        <img src={lodge.images[2] || lodge.images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt={lodge.name} />
                    </div>
                    <div className="hidden lg:block lg:col-span-2 lg:row-span-1 relative overflow-hidden rounded-[32px] shadow-xl">
                        <img src={lodge.images[3] || lodge.images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt={lodge.name} />
                    </div>
                </div>

                <div className="absolute top-10 left-10 z-30 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 flex items-center justify-center text-white bg-surface/20 hover:bg-surface/40 backdrop-blur-xl rounded-full border border-white/10 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute top-10 right-10 z-30 flex items-center gap-4">
                    <button className="w-12 h-12 flex items-center justify-center text-white bg-surface/20 hover:bg-surface/40 backdrop-blur-xl rounded-full border border-white/10 transition-all">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center text-white bg-surface/20 hover:bg-surface/40 backdrop-blur-xl rounded-full border border-white/10 transition-all group/heart">
                        <Heart className="w-5 h-5 group-hover/heart:fill-red-500 group-hover/heart:text-red-500 transition-colors" />
                    </button>
                </div>
            </section>

            <section className="py-20 -mt-10 relative z-20">
                <div className="section-container">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                        {/* Main Content Side */}
                        <div className="lg:col-span-7 space-y-20">

                            {/* Header for Mobile */}
                            <div className="lg:hidden">
                                <h1 className="text-4xl font-bold text-white mb-4 italic">{lodge.name}</h1>
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <span>{lodge.location}</span>
                                </div>
                            </div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="card bg-surface-light border-surface-border p-6 flex flex-col items-center text-center">
                                    <Star className="w-8 h-8 text-primary mb-3 fill-primary/20" />
                                    <div className="text-lg font-bold text-white">4.9 / 5.0</div>
                                    <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Guest Rating</div>
                                </div>
                                <div className="card bg-surface-light border-surface-border p-6 flex flex-col items-center text-center">
                                    <Award className="w-8 h-8 text-primary mb-3" />
                                    <div className="text-lg font-bold text-white">Eco Winner</div>
                                    <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">2023 Achievement</div>
                                </div>
                                <div className="card bg-surface-light border-surface-border p-6 flex flex-col items-center text-center col-span-2 md:col-span-1">
                                    <Zap className="w-8 h-8 text-primary mb-3" />
                                    <div className="text-lg font-bold text-white">Live Sync</div>
                                    <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Real-time Rates</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-8">
                                <h2 className="text-3xl font-bold text-white italic">The <span className="text-primary tracking-widest uppercase text-sm font-black">Experience</span></h2>
                                <p className="text-neutral-400 text-lg leading-relaxed font-light">
                                    {lodge.description || "Perched on the side of a mountain, Dorze Lodge overlooks the stunning Great Rift Valley. Our traditional bamboo-thatched cottages are hand-crafted by local artisans, offering a unique blend of authentic heritage and refined comfort. Wake up to the sound of nature and enjoy locally-sourced coffee as the sun rises over the horizon."}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    {lodge.amenities?.map(amenity => {
                                        const Icon = amenityIcons[amenity] || ShieldCheck;
                                        return (
                                            <div key={amenity} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface-light border border-surface-border text-neutral-300">
                                                <Icon className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-bold uppercase tracking-wider">{amenity}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Room Selection / Availability Grid */}
                            <div className="space-y-10">
                                <h2 className="text-3xl font-bold text-white italic">Room <span className="text-primary tracking-widest uppercase text-sm font-black">Selection</span></h2>
                                <div className="grid gap-8">
                                    {lodge.roomTypes?.map((room) => (
                                        <motion.div
                                            key={room.type}
                                            className="group p-8 rounded-[40px] bg-surface-light border border-surface-border hover:border-primary/50 transition-all flex flex-col md:flex-row gap-8"
                                        >
                                            <div className="w-full md:w-64 h-48 rounded-[32px] overflow-hidden bg-surface group-hover:ring-1 ring-primary/30 transition-all">
                                                <img src={lodge.images[1] || lodge.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-2">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-2xl font-bold text-white">{room.type}</h3>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-black text-primary">${room.price}</div>
                                                            <div className="text-[10px] text-neutral-500 uppercase font-bold">per night</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-neutral-500 mb-6 leading-relaxed">Includes premium breakfast, traditional coffee ceremony, and sunrise terrace access.</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {room.amenities?.map((a: string) => (
                                                            <Badge key={a} variant="secondary" className="bg-surface border-surface-border text-[9px] uppercase tracking-tighter">{a}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mt-8 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        <span className="text-xs text-neutral-400 font-medium">Free cancellation before 48h</span>
                                                    </div>
                                                    <Button variant="accent" className="h-12 px-8 rounded-2xl text-xs font-black uppercase tracking-widest" onClick={() => navigate(`/booking/${lodgeId}?type=lodge&room=${room.type}`)}>
                                                        Swift Book
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / Availability Calendar */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-24 space-y-8">
                                <AvailabilityCalendar
                                    lodgeId={lodgeId}
                                    onSelectDates={(inDate, outDate) => setSelectedDates({ in: inDate, out: outDate })}
                                />

                                <AnimatePresence>
                                    {selectedDates && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            className="card bg-primary p-10 rounded-[40px] border-none shadow-2xl overflow-hidden relative"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>

                                            <h3 className="text-2xl font-bold text-surface mb-8 italic">Booking <span className="tracking-widest opacity-80 uppercase text-xs">Summary</span></h3>

                                            <div className="space-y-6 mb-10">
                                                <div className="flex justify-between items-center text-surface/80">
                                                    <span className="text-xs font-bold uppercase tracking-widest">Duration</span>
                                                    <span className="text-sm font-black">{format(selectedDates.in, 'MMM dd')} — {format(selectedDates.out, 'MMM dd')}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-surface/80">
                                                    <span className="text-xs font-bold uppercase tracking-widest">Check-in Vibe</span>
                                                    <span className="text-sm font-black underline decoration-white/30 decoration-offset-2">Mountain View Guaranteed</span>
                                                </div>
                                            </div>

                                            <Button
                                                variant="secondary"
                                                className="w-full h-16 bg-surface text-primary border-none text-lg font-black rounded-3xl hover:bg-surface/90"
                                                onClick={() => navigate(`/booking/${lodgeId}?type=lodge&checkIn=${format(selectedDates.in, 'yyyy-MM-dd')}&checkOut=${format(selectedDates.out, 'yyyy-MM-dd')}`)}
                                            >
                                                Reserve Now
                                                <ChevronRight className="ml-2 w-5 h-5" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="p-8 rounded-[32px] border border-surface-border bg-surface-light flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Info className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1">Travel Insurance</h4>
                                        <p className="text-xs text-neutral-500 leading-relaxed">Protect your journey. Add insurance at the final checkout step for complete peace of mind.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}

function LodgeDetailSkeleton() {
    return (
        <div className="min-h-screen bg-surface">
            <Skeleton className="h-[75vh] w-full" />
            <div className="section-container py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-7 space-y-12">
                        <Skeleton className="h-20 w-3/4" />
                        <Skeleton className="h-64 w-full" />
                        <div className="grid grid-cols-1 gap-8">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                        </div>
                    </div>
                    <div className="lg:col-span-5">
                        <Skeleton className="h-[600px] w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
