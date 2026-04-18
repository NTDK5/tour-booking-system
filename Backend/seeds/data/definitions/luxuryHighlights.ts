import { IMG } from '../mediaAssets';
import { activity, itineraryDay } from '../itineraryHelpers';

export const luxuryHighlightsPackage = {
    schemaVersion: 2,
    packageCode: 'ETH-LUX-14D',
    title: 'Luxury Ethiopia Highlights — Private Jets, Palace Suites & Sommelier Dining',
    slug: 'luxury-ethiopia-highlights-private-jets-palace-suites',
    shortDescription:
        'Fourteen-day ultra-premium odyssey pairing chartered domestic wings, palace-grade suites in Lalibela and Lake Langano, sommelier-curated Rift Valley wine dinners, and dedicated concierge rotation teams.',
    fullDescription: `Designed for collectors of rare travel experiences, Luxury Ethiopia Highlights layers private aviation between distant nodes, castle-view suites, and chef’s-table storytelling. Each segment includes discrete security drivers, spa credits, and personalized shopping hours with ethical sourcing guarantees. Cultural content mirrors flagship Dorze intellectual rigor yet elevates pacing: later starts, longer spa buffers, and optional helicopter scouting where legislation permits.`,
    category: 'Luxury Journeys',
    tourType: 'cultural',
    status: 'published',
    featured: true,
    difficulty: 'easy',
    duration: { days: 14, nights: 13 },
    destinations: ['Addis Ababa', 'Bahir Dar', 'Gondar', 'Lalibela', 'Langano', 'Awassa'],
    startLocation: 'Private lounge Bole International',
    endLocation: 'Bole International departure suite',
    destination: 'Ethiopia Luxury Circuit',
    legacyDestination: 'Ethiopia Luxury Circuit',
    basePrice: 14850,
    price: 14850,
    pricingType: 'fixed_group',
    groupPricing: [{ minGuests: 2, maxGuests: 6, fixedPrice: 84200 }],
    seasonalPricing: [
        { name: 'Year-end festive premium', startMonth: 12, startDay: 15, endMonth: 1, endDay: 10, multiplier: 1.15 },
    ],
    childPolicy: { childAgeMax: 16, discountPercent: 10, freeUnderAge: 0 },
    minGuests: 2,
    maxGuests: 6,
    departureType: 'on_request',
    bookingCutoffHours: 720,
    included: [
        'Domestic charter flight blocks or flex first-class equivalents',
        'All palace/luxury suite categories listed or upgraded equivalents',
        'Private guide & concierge duo per two travelers',
        'Sommelier dinners ×5 & chef’s table ×3',
        'VIP airport protocols domestically',
        'Spa allowance $150/person/stop',
        'Laundry daily',
        'Carbon-offset premium tier',
    ],
    excluded: [
        'International first-class airfare',
        'Exclusive-use helicopter scouting (optional add-on)',
        'Personal shopping above stipends',
        'Premium cellar vintage supplements',
    ],
    highlights: [
        'Sunrise helicopter scouting slot above Lalibela (weather/legal)',
        'Private castle dinner in Gondar ramparts',
        'Langano lakeside villa with infinity pool',
        'Rift Valley wine estate blending workshop',
    ],
    accommodations: [
        {
            destination: 'Addis Ababa',
            hotelCategory: '5-star palace',
            hotelOptions: [{ name: 'Sheraton Addis Luxury Suite Wing', notes: 'Butler service' }],
        },
        {
            destination: 'Lalibela',
            hotelCategory: 'ultra-luxury lodge',
            hotelOptions: [{ name: 'Maribela Cliff Villa', notes: 'Private plunge pool' }],
        },
    ],
    transportSegments: [
        { type: 'flight', route: 'Charter web domestic', vehicleType: 'King Air / PC-12 class' },
        { type: 'road', route: 'Armored luxury SUV convoy', vehicleType: 'Toyota Land Cruiser Executive' },
    ],
    depositPercent: 40,
    cancellationPolicy:
        'Luxury inventory held with 40% deposit; cancellations inside 120 days subject to charter and suite penalties itemized case-by-case.',
    childDiscountRules: 'Families accommodated with interconnecting suites; bespoke pricing via concierge desk.',
    addons: [
        { name: 'Exclusive-use helicopter hour (max 3 pax)', price: 4200, optional: true, description: 'Subject NOTAM & permits' },
        { name: 'Private sommelier cellar raid', price: 890, optional: true, description: 'Rare vintages billed consumption' },
        { name: 'Diamond-grade jewelry consult', price: 450, optional: true, description: 'Personal shopper session (minimum fee)' },
    ],
    guideRequired: true,
    vehicleRequired: true,
    hotelRequired: true,
    coverImage: IMG.luxury,
    gallery: [IMG.luxury, IMG.gallery3, IMG.heroNorth],
    imageUrl: [IMG.luxury],
    metaTitle: 'Luxury Ethiopia Tour | Private Aviation & Palace Suites | Dorze Tours',
    metaDescription:
        'Ultra-premium fourteen-day Ethiopia journey with chartered domestic flights, castle dinners, Lalibela cliff villas, and sommelier-led Rift Valley experiences.',
    averageRating: 4.95,
    totalRatings: 28,
    itinerary: Array.from({ length: 14 }).map((_, i) =>
        itineraryDay({
            day: i + 1,
            title: `Luxury Segment ${i + 1} — Curated Slow Travel`,
            description: `Day ${i + 1} blends private cultural access with restorative intervals: spa circuits, chef tastings, and flexible touring windows guided by mood boards submitted pre-trip. Concierge adjusts sequencing daily while preserving intellectual depth through scholar drop-ins.`,
            activities: [
                activity('09:30', 'Private cultural site opening'),
                activity('14:00', 'Spa / wellness block'),
                activity('19:30', 'Sommelier or chef’s table'),
            ],
            mealsIncluded: ['Breakfast', 'Lunch', 'Dinner'],
            overnight: i % 4 === 0 ? 'Addis palace suite' : i % 4 === 1 ? 'Lalibela cliff villa' : 'Langano lake villa',
            accommodationLevel: 'Ultra-luxury',
        })
    ),
};
