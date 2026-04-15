// ============================================================
// Core domain types for Dorze Tours v2
// ============================================================

export interface User {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'user' | 'admin';
    verified: boolean;
    avatar?: string;
    phone?: string;
    nationality?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthUser extends User {
    token: string;
}

export interface Tour {
    _id: string;
    title: string;
    description: string;
    shortDescription?: string;
    destination: string;
    duration: number; // days
    groupSize: number;
    price: number;
    discountPrice?: number;
    images: string[];
    imageUrl?: string[];
    highlights: string[];
    included: string[];
    excluded: string[];
    itinerary: ItineraryDay[];
    tourType: TourType;
    difficulty: 'easy' | 'moderate' | 'challenging';
    rating: number;
    reviewCount: number;
    featured: boolean;
    tags: string[];
    coordinates?: { lat: number; lng: number };
    availableDates?: string[];
    createdAt: string;
    updatedAt: string;
}

export type TourType = 'cultural' | 'adventure' | 'wildlife' | 'photography' | 'trekking' | 'historical';

export interface ItineraryDay {
    day: number;
    title: string;
    description: string;
    activities: (string | { time: string; activity: string; _id?: string })[];
    accommodation?: string;
    meals?: ('breakfast' | 'lunch' | 'dinner')[];
}

export interface Lodge {
    _id: string;
    name: string;
    description: string;
    location: string;
    images: string[];
    pricePerNight: number;
    amenities: string[];
    rating: number;
    reviewCount: number;
    featured: boolean;
    roomTypes: RoomType[];
    coordinates?: { lat: number; lng: number };
    createdAt: string;
    updatedAt: string;
}

export interface RoomType {
    type: string;
    description?: string;
    price: number;
    maxGuests?: number;
    amenities: string[];
    image?: string;
    availableRooms?: number;
}

export interface Car {
    _id: string;
    brand: string;
    model: string;
    year: number;
    plateNumber: string;
    pricePerDay: number;
    capacity: number;
    transmission: 'manual' | 'automatic';
    fuelType: 'petrol' | 'diesel';
    images: string[];
    available: boolean;
    features: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Booking {
    _id: string;
    user?: string | User;
    tour?: string | Tour;
    lodge?: string | Lodge;
    car?: string | Car;
    carId?: string;
    bookingType: 'tour' | 'lodge' | 'car';
    startDate?: string;
    endDate?: string;
    checkInDate?: string;
    checkOutDate?: string;
    bookingDate?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    guests?: number;
    numberOfPeople?: number;
    totalPrice: number;
    status?: BookingStatus;
    travelerDetails?: TravelerDetails;
    paymentStatus?: 'pending' | 'paid' | 'refunded' | 'unpaid';
    paymentMethod?: string;
    notes?: string;
    proposedPrice?: number;
    offer?: {
        finalPrice: number;
        currency?: string;
        adminNotes?: string;
        validUntil?: string;
        basedOnEstimate?: number;
        breakdown?: {
            label: string;
            amount: number;
            reason?: string;
        }[];
    };
    estimateSnapshot?: {
        estimatedBudget?: number;
        finalPrice?: number;
        priceChangeReasons?: string[];
        pricingBreakdown?: {
            basePerDay?: number;
            daysCost?: number;
            optionsCost?: number;
            modeMultiplier?: number;
            subtotal?: number;
            finalTotal?: number;
        };
    };
    isRequest?: boolean;
    customTrip?: string | {
        _id: string;
        days?: number;
        estimatedBudget?: number;
        finalPrice?: number;
        itinerary?: any[];
        reviewedItinerary?: any[];
        changeSummary?: {
            field: string;
            previousValue?: string;
            newValue?: string;
            reason: string;
        }[];
    };
    customCarRequest?: {
        carType: string;
        passengerCapacity: number;
        transmission: 'automatic' | 'manual' | 'any';
        checkInDate: string;
        checkOutDate: string;
        notes?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export type BookingStatus =
    | 'pending'
    | 'under_review'
    | 'offer_sent'
    | 'confirmed'
    | 'cancelled'
    | 'completed'
    | 'submitted'
    | 'offered'
    | 'accepted'
    | 'rejected';

export interface BookingTimelineEvent {
    type: 'status' | 'audit';
    status?: string;
    action?: string;
    actionType?: string;
    details?: string;
    actorRole?: 'admin' | 'user' | 'system';
    comment?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface TravelerDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    passportNumber?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
}

export interface Review {
    _id: string;
    user: User | string;
    tour?: string;
    lodge?: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
    createdAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

// Filter & sort types
export interface TourFilters {
    destination?: string;
    days?: number;
    minPrice?: number;
    maxPrice?: number;
    duration?: number;
    rating?: number;
    tourType?: TourType;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'price' | 'rating' | 'popularity' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    featured?: boolean;
}

export interface LodgeFilters {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'pricePerNight' | 'rating' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    featured?: boolean;
}

// Booking flow types
export interface BookingFormStep1 {
    startDate: string;
    guests: number;
}

export interface BookingFormStep2 extends TravelerDetails {
    specialRequests?: string;
}

export interface BookingFormStep3 {
    paymentMethod: 'paypal' | 'card';
}

export interface BookingStepData {
    step1?: BookingFormStep1;
    step2?: BookingFormStep2;
    step3?: BookingFormStep3;
}

// Dashboard types
export interface DashboardStats {
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    totalSpent: number;
    savedTours: number;
}
