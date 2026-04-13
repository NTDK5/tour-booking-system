import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import {
    User as UserIcon,
    Mail,
    Shield,
    MapPin,
    Calendar,
    Edit3,
    Package,
    Star,
    Settings,
    ChevronRight,
    Clock,
    MessageSquare,
    X,
    StarHalf
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserBookings } from '@/hooks/useBookings';
import { useMyReviews, useCreateReview } from '@/hooks/useReviews';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';

type Tab = 'profile' | 'bookings' | 'reviews';

export default function ProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [reviewingBooking, setReviewingBooking] = useState<any>(null);

    const { data: bookings, isLoading: bookingsLoading } = useUserBookings();
    const { data: reviews, isLoading: reviewsLoading } = useMyReviews();

    if (!user) return null;

    return (
        <div className="space-y-10 animate-fade-in max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-surface-light p-8 rounded-3xl border border-surface-border shadow-soft">
                <div className="relative group">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-primary/20 overflow-hidden">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-12 h-12 md:w-16 md:h-16" />
                        )}
                    </div>
                </div>
                <div className="text-center md:text-left flex-grow">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                        <h1 className="text-3xl font-extrabold text-white">{user.first_name} {user.last_name}</h1>
                        <Badge variant="accent" className="uppercase tracking-widest text-[10px] py-1 px-3">
                            {user.role}
                        </Badge>
                    </div>
                    <p className="text-neutral-400 flex items-center justify-center md:justify-start gap-2 mb-4">
                        <Mail className="w-4 h-4 text-primary" />
                        {user.email}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <Button variant="secondary" size="sm" className="gap-2 rounded-xl">
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1.5 bg-surface-light rounded-2xl border border-surface-border w-fit">
                {(['profile', 'bookings', 'reviews'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all capitalize ${activeTab === tab
                                ? 'bg-primary text-white shadow-glow'
                                : 'text-neutral-500 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'profile' && <ProfileSettings user={user} />}
                        {activeTab === 'bookings' && <BookingHistory
                            bookings={bookings || []}
                            isLoading={bookingsLoading}
                            onReview={(b: any) => setReviewingBooking(b)}
                        />}
                        {activeTab === 'reviews' && <ReviewHistory reviews={reviews || []} isLoading={reviewsLoading} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Review Modal */}
            {reviewingBooking && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <ReviewForm
                        booking={reviewingBooking}
                        onClose={() => setReviewingBooking(null)}
                    />
                </div>
            )}
        </div>
    );
}

function ProfileSettings({ user }: { user: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card bg-surface-light p-8 border-surface-border">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <Settings className="w-6 h-6 text-primary" />
                    Account Security
                </h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-surface border border-surface-border">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-white">Two-Factor Auth</p>
                                <p className="text-sm text-neutral-500">Add an extra layer of security.</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-white hover:bg-primary">Enable</Button>
                    </div>
                </div>
            </div>

            <div className="card bg-surface-light p-8 border-surface-border">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary" />
                    Personal Info
                </h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-1">First Name</p>
                            <p className="text-white font-medium">{user.first_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-1">Last Name</p>
                            <p className="text-white font-medium">{user.last_name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BookingHistory({ bookings, isLoading, onReview }: { bookings: any[], isLoading: boolean, onReview: (b: any) => void }) {
    if (isLoading) return <div className="space-y-4"><Skeleton className="h-32 w-full rounded-2xl" /><Skeleton className="h-32 w-full rounded-2xl" /></div>;

    if (!bookings || bookings.length === 0) {
        return (
            <div className="text-center py-20 bg-surface-light rounded-3xl border border-dashed border-surface-border">
                <Package className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
                <p className="text-neutral-500">Your future adventures will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking: any) => (
                <div key={booking._id} className="group bg-surface-light border border-surface-border rounded-3xl p-6 transition-all hover:border-primary/30 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                        <img
                            src={booking.tour?.images?.[0] || booking.lodge?.images?.[0] || booking.car?.images?.[0] || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600'}
                            alt="Service"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge variant="secondary" className="mb-2 uppercase text-[9px] tracking-tighter">
                                    {booking.bookingType}
                                </Badge>
                                <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                    {booking.tour?.title || booking.lodge?.name || (booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Booking')}
                                </h4>
                            </div>
                            <Badge variant={booking.status === 'confirmed' ? 'success' : 'outline'}>
                                {booking.status}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-6 mt-4">
                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <Calendar className="w-4 h-4 text-primary" />
                                {format(new Date(booking.startDate || booking.bookingDate || booking.createdAt), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-white ml-auto">
                                Total: ${booking.totalPrice}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                        <Button variant="outline" size="sm" className="rounded-xl">View Details</Button>
                        {booking.status === 'confirmed' && (
                            <Button
                                variant="primary"
                                size="sm"
                                className="rounded-xl gap-2"
                                onClick={() => onReview(booking)}
                            >
                                <MessageSquare className="w-4 h-4" />
                                Leave Review
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ReviewHistory({ reviews, isLoading }: { reviews: any[], isLoading: boolean }) {
    if (isLoading) return <div className="space-y-4"><Skeleton className="h-32 w-full rounded-2xl" /><Skeleton className="h-32 w-full rounded-2xl" /></div>;

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-20 bg-surface-light rounded-3xl border border-dashed border-surface-border">
                <Star className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
                <p className="text-neutral-500">Share your experiences with the community!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review: any) => (
                <div key={review._id} className="bg-surface-light border border-surface-border rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-white mb-1">{review.title}</h4>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest">
                                For: {review.tour?.title || review.lodge?.name || (review.car ? `${review.car.brand} ${review.car.model}` : 'Service')}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-primary' : 'text-neutral-700'}`} />
                            ))}
                        </div>
                    </div>
                    <p className="text-neutral-400 text-sm italic leading-relaxed">"{review.comment}"</p>
                    <p className="text-[10px] text-neutral-600 font-medium">
                        Posted on {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                    </p>
                </div>
            ))}
        </div>
    );
}

function ReviewForm({ booking, onClose }: { booking: any, onClose: () => void }) {
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const createReview = useCreateReview();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            rating,
            title,
            comment,
            tourId: booking.tour?._id,
            lodgeId: booking.lodge?._id,
            carId: booking.car?._id
        };

        await createReview.mutateAsync(payload);
        onClose();
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface-light rounded-3xl p-8 w-full max-w-lg border border-surface-border relative"
        >
            <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white">
                <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Leave a Review</h2>
            <p className="text-neutral-500 mb-8">How was your experience with <span className="text-primary font-bold">{booking.tour?.title || booking.lodge?.name || 'this service'}</span>?</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                type="button"
                                key={s}
                                onClick={() => setRating(s)}
                                className={`p-2 transition-all ${s <= rating ? 'text-primary scale-110' : 'text-neutral-700 hover:text-neutral-500'}`}
                            >
                                <Star className={`w-8 h-8 ${s <= rating ? 'fill-primary' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Review Title</label>
                    <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Sum up your experience..."
                        className="w-full bg-surface border border-surface-border rounded-xl px-5 py-3 text-white focus:border-primary outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Detailed Comment</label>
                    <textarea
                        required
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us more about the highlights of your trip..."
                        rows={4}
                        className="w-full bg-surface border border-surface-border rounded-xl px-5 py-3 text-white focus:border-primary outline-none transition-all resize-none"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-2xl">Cancel</Button>
                    <Button type="submit" isLoading={createReview.isPending} className="flex-1 rounded-2xl">Submit Review</Button>
                </div>
            </form>
        </motion.div>
    );
}
