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
    fullDescription?: string;
    destination: string;
    destinations?: string[];
    duration: number; // legacy UI expects numeric days
    durationDetails?: { days: number; nights?: number }; // enterprise fallback
    groupSize: number;
    minGuests?: number;
    maxGuests?: number;
    bookingCutoffHours?: number;
    price: number;
    basePrice?: number;
    pricingType?: 'per_person' | 'fixed_group' | 'hybrid';
    depositPercent?: number;
    discountPrice?: number;
    images: string[];
    imageUrl?: string[];
    highlights: string[];
    included: string[];
    excluded: string[];
    addons?: { name: string; price: number; optional?: boolean; description?: string }[];
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

export interface BookingPaymentSummary {
    totalPaid: number;
    balanceDue: number;
    paymentStatus: 'unpaid' | 'partial' | 'paid';
}

export interface PaymentLedgerEntry {
    _id?: string;
    paymentType?: 'deposit' | 'balance' | 'refund' | 'adjustment';
    amount: number;
    currency?: string;
    method?: string;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    transactionReference?: string;
    provider?: string;
    paidAt?: string;
    notes?: string;
}

export interface PricingSnapshot {
    baseAmount?: number;
    groupDiscountAmount?: number;
    seasonalAdjustmentAmount?: number;
    addOnsTotal?: number;
    subtotal: number;
    depositAmount?: number;
    totalAmount: number;
    currency?: string;
    lines?: { label: string; amount: number }[];
}

export interface BookingTraveler {
    fullName: string;
    travelerType?: 'adult' | 'child' | 'infant';
    passportNumber?: string;
    nationality?: string;
}

export interface TourAddonOption {
    name: string;
    price: number;
    optional?: boolean;
    description?: string;
}

export interface BookingDepartureOption {
    _id: string;
    sku?: string;
    startsAt: string;
    endsAt?: string;
    status: 'scheduled' | 'open' | 'full' | 'cancelled';
    capacity: number;
    reservedGuests: number;
    confirmedGuests: number;
    seatsLeft: number;
}

export interface BookingQuoteResponse {
    available: boolean;
    reasons: string[];
    quote: {
        currency: string;
        lines: { label: string; amount: number }[];
        subtotal: number;
        discounts: number;
        deposit: number;
        total: number;
        pricingType: string;
    };
    pricingSnapshot: PricingSnapshot;
    addOnLines: {
        addonKey: string;
        name: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
    }[];
}

export type StaffRole = 'guide' | 'driver' | 'coordinator' | 'translator' | 'support';
export type StaffStatus = 'active' | 'inactive';
export type StaffAvailability = 'available' | 'assigned' | 'on_leave' | 'unavailable';

export interface Staff {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
    avatar?: string;
    status: StaffStatus;
    role: StaffRole;
    availability: StaffAvailability;
    skills?: {
        languages?: string[];
        destinations?: string[];
        certifications?: string[];
        licenseTypes?: string[];
        vehicleTypes?: string[];
        departments?: string[];
    };
    hireDate?: string;
    notes?: string;
    currentAssignmentsCount?: number;
    lastAssignedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StaffAssignment {
    _id: string;
    staffId: string | Staff;
    role: 'guide' | 'driver';
    departureId: string;
    bookingId?: string;
    customTripId?: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'cancelled';
}

export interface Booking {
    _id: string;
    /** Enterprise human-readable ref */
    bookingNumber?: string;
    lifecycleStatus?: 'draft' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
    inventoryPhase?: 'none' | 'reserved' | 'confirmed' | 'released';
    pricingSnapshot?: PricingSnapshot;
    paymentLedger?: PaymentLedgerEntry[];
    paymentSummary?: BookingPaymentSummary;
    travelers?: BookingTraveler[];
    workflow?: {
        workflowStatus?: string;
        voucherIssued?: boolean;
        documentsSent?: boolean;
        operationsAssigned?: boolean;
    };
    documents?: {
        voucherUrl?: string;
        invoiceUrl?: string;
        receiptUrls?: string[];
    };
    auditTrail?: {
        action: string;
        timestamp?: string;
        notes?: string;
        metadata?: Record<string, unknown>;
    }[];
    assignedGuide?: unknown;
    assignedVehicle?: unknown;
    assignedHotels?: { lodgeId?: string; name?: string; destination?: string }[];
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
    paymentStatus?: 'pending' | 'paid' | 'refunded' | 'unpaid' | 'partial';
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
    | 'draft'
    | 'pending_payment'
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
