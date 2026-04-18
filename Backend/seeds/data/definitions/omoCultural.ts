import { IMG } from '../mediaAssets';
import { activity, itineraryDay } from '../itineraryHelpers';

export const omoCulturalPackage = {
    schemaVersion: 2,
    packageCode: 'ETH-OMO-11D',
    title: 'Omo Valley Cultural Discovery — Tribal Traditions & Lower Omo Rivers',
    slug: 'omo-valley-cultural-discovery-tribal-traditions',
    shortDescription:
        'Eleven-day respectful immersion among Lower Omo communities: Hamar bull-jumping insight sessions, Konso terrace agriculture, Dasenech river ceremonies, and ethical photography protocols led by anthropologist-trained guides.',
    fullDescription: `Travel south from Addis through Rift Valley lakes into the kaleidoscopic Omo ecosystem. This itinerary prioritizes reciprocity: community fees are prepaid, portrait sessions require verbal consent translation, and evening forums unpack tourism impacts with nuance. Trace seasonal cattle camps, river crossing markets, and artisan cooperatives producing beadwork and pottery. Lodging blends eco-lodges with fixed tent camps positioned near villages yet buffered for privacy—every encounter choreographed to minimize intrusion while maximizing understanding.`,
    category: 'Indigenous Culture',
    tourType: 'cultural',
    status: 'published',
    featured: false,
    difficulty: 'moderate',
    duration: { days: 11, nights: 10 },
    destinations: ['Addis Ababa', 'Hawassa', 'Arba Minch', 'Konso', 'Turmi', 'Jinka', 'Mago'],
    startLocation: 'Addis Ababa Bole Airport',
    endLocation: 'Jinka Airport (connect via Addis)',
    destination: 'Omo Valley',
    legacyDestination: 'Omo Valley',
    basePrice: 4120,
    price: 4120,
    pricingType: 'hybrid',
    groupPricing: [
        { minGuests: 2, maxGuests: 6, fixedPrice: 22800 },
        { minGuests: 7, maxGuests: 10, pricePerPerson: 3890 },
    ],
    seasonalPricing: [
        { name: 'Bull-jumping peak interest', startMonth: 1, startDay: 20, endMonth: 4, endDay: 10, multiplier: 1.05 },
    ],
    childPolicy: { childAgeMax: 16, discountPercent: 20, freeUnderAge: 4 },
    minGuests: 2,
    maxGuests: 10,
    departureType: 'on_request',
    bookingCutoffHours: 240,
    included: [
        '4WD convoy with mechanic chase vehicle on remote legs',
        'Community access fees & chief introduction letters',
        'English anthropologist-trained lead guide + local language mediators',
        'Eco-lodges & semi-permanent tented camps with ensuite where available',
        'All meals outside Addis (mixed buffet & set menus)',
        'Bottled water ration (3L/day) + filtration station in vehicle',
        'Donation kit: school supplies sourced from Addis ethical supplier',
    ],
    excluded: [
        'International airfare',
        'Portrait photography fees paid directly to families if beyond scheduled shoots',
        'Alcohol except welcome beer',
        'Personal gifts or impulse purchases in markets',
        'Travel insurance covering remote evacuation',
    ],
    highlights: [
        'Hamar bull-jumping arena ethics briefing',
        'Konso UNESCO terrace agriculture interpretive hike',
        'Mago National Park wildlife drive en route to Mursi highlands viewpoint',
        'Turmi weekly market timing when calendar aligns',
    ],
    accommodations: [
        {
            destination: 'Arba Minch',
            hotelCategory: '4-star resort',
            hotelOptions: [{ name: 'Paradise Lodge', notes: 'Overlooks twin lakes' }],
        },
        {
            destination: 'Turmi',
            hotelCategory: 'eco fixed camp',
            hotelOptions: [{ name: 'Turmi Lodge', notes: 'Stone bungalows with fans' }],
        },
    ],
    transportSegments: [
        { type: 'flight', route: 'ADD → Arba Minch', vehicleType: 'Scheduled flight + 4WD' },
        { type: 'road', route: 'Southern circuit dirt highways', vehicleType: 'Toyota Land Cruiser convoy' },
        { type: 'boat', route: 'Lake Chamo hippo safari', vehicleType: 'Metal touring boat with life jackets' },
    ],
    depositPercent: 30,
    cancellationPolicy:
        'Community permits purchased 45 days out; cancellations inside 60 days forfeit deposit portion equal to prepaid village fees.',
    childDiscountRules: 'Families encouraged but remote heat/stamina considerations—consult Dorze family travel desk.',
    addons: [
        { name: 'Drone permit assistance (where legal)', price: 275, optional: true, description: 'Paperwork + scout presence' },
        { name: 'Private cultural mediator', price: 950, optional: true, description: 'Dedicated anthropologist graduate student' },
        { name: 'Premium tent suite upgrade', price: 340, optional: true, description: 'Raised canvas suite with ensuite bucket shower' },
    ],
    guideRequired: true,
    vehicleRequired: true,
    hotelRequired: true,
    coverImage: IMG.omo,
    gallery: [IMG.omo, IMG.gallery1, IMG.gallery3],
    imageUrl: [IMG.omo],
    metaTitle: 'Omo Valley Cultural Tour | Ethiopia Tribal Discovery | Dorze Tours',
    metaDescription:
        'Ethical Omo Valley itinerary with Hamar, Konso, and Dasenech encounters, eco-lodges, and anthropologist-trained guides.',
    averageRating: 4.78,
    totalRatings: 64,
    itinerary: Array.from({ length: 11 }).map((_, i) => {
        const day = i + 1;
        const titles = [
            'Addis → Hawassa Lakeshore',
            'Hawassa → Arba Minch Rift Gates',
            'Lake Chamo Boat Safari',
            'Arba Minch → Konso Terraces',
            'Konso Village Craft Trail',
            'Konso → Turmi Market Timing',
            'Hamar Cultural Respect Day',
            'Turmi → Jinka Museum & Research',
            'Jinka → Mago Wildlife Traverse',
            'Mago → Departure Prep & Craft Fair',
            'Fly Jinka–Addis — Journey Complete',
        ];
        return itineraryDay({
            day,
            title: titles[i],
            description: `Detailed cultural facilitation with rotating emphasis on consent protocols, craft economics, and oral history capture. Day ${day} balances driving endurance with immersive stops; Dorze guides adjust sequencing based on live community calendars ensuring dignified encounters.`,
            activities: [
                activity('09:00', 'Community introduction circle'),
                activity('15:30', 'Photography ethics debrief'),
                activity('19:00', 'Fireside discussion on reciprocity tourism'),
            ],
            mealsIncluded: day === 1 ? ['Dinner'] : day === 11 ? ['Breakfast'] : ['Breakfast', 'Lunch', 'Dinner'],
            overnight: day <= 2 ? 'Hawassa / Arba Minch' : day <= 6 ? 'Konso / Turmi' : 'Jinka region',
            accommodationLevel: day % 3 === 0 ? 'Eco lodge' : 'Heritage camp',
        });
    }),
};
