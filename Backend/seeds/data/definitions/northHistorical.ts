import { IMG } from '../mediaAssets';
import { activity, itineraryDay } from '../itineraryHelpers';

/** Historic north circuit — Lalibela, Axum, Gondar, Bahir Dar — flagship cultural program */
export const northHistoricalPackage = {
    schemaVersion: 2,
    packageCode: 'ETH-NORTH-12D',
    title: 'Historic North Ethiopia — Rock Churches & Imperial Cities',
    slug: 'historic-north-ethiopia-rock-churches-imperial-cities',
    shortDescription:
        'Twelve-day premium circuit across Ethiopia’s northern highlands: medieval rock-hewn churches, imperial castles, island monasteries, and vibrant Amhara-Tigray heritage with expert-led interpretation.',
    fullDescription: `This flagship Dorze Tours itinerary connects Ethiopia’s most iconic UNESCO clusters with calm pacing, premium lodging, and curated cultural encounters. Begin in Addis Ababa with orientation and cuisine, fly north to Bahir Dar for Lake Tana’s island monasteries and the Blue Nile Falls, continue to Gondar’s seventeenth-century castles, explore Simien gateway viewpoints, then delve into Axum’s stelae fields and Christianity’s deep roots before culminating in Lalibela’s twelve rock-hewn sanctuaries—each day balancing guided depth with rest, photography windows, and ethical community visits. Evening briefings prepare you for the next region’s historical arc while logistics remain seamless behind the scenes.`,
    category: 'Heritage & Culture',
    tourType: 'historical',
    status: 'published',
    featured: true,
    difficulty: 'moderate',
    duration: { days: 12, nights: 11 },
    destinations: ['Addis Ababa', 'Bahir Dar', 'Gondar', 'Simien foothills', 'Axum', 'Lalibela'],
    startLocation: 'Bole International Airport (ADD), Addis Ababa',
    endLocation: 'Lalibela Airport (LLI) or return via ADD',
    destination: 'Northern Historic Circuit',
    legacyDestination: 'Northern Historic Circuit',
    basePrice: 3850,
    price: 3850,
    pricingType: 'per_person',
    groupPricing: [
        { minGuests: 1, maxGuests: 1, pricePerPerson: 4280 },
        { minGuests: 2, maxGuests: 5, pricePerPerson: 3850 },
        { minGuests: 6, maxGuests: 10, pricePerPerson: 3420 },
        { minGuests: 11, maxGuests: 16, pricePerPerson: 3190 },
    ],
    seasonalPricing: [
        {
            name: 'Peak dry season',
            startMonth: 10,
            startDay: 15,
            endMonth: 2,
            endDay: 28,
            multiplier: 1.08,
        },
        {
            name: 'Green season value',
            startMonth: 6,
            startDay: 1,
            endMonth: 9,
            endDay: 15,
            multiplier: 0.94,
        },
    ],
    childPolicy: {
        childAgeMax: 12,
        discountPercent: 25,
        freeUnderAge: 5,
    },
    minGuests: 2,
    maxGuests: 16,
    departureType: 'fixed_schedule',
    bookingCutoffHours: 168,
    included: [
        'Private 4WD transport on touring days with fuel and driver-guide coordination',
        'Domestic flights ADD–BDQ, GDQ–AXU, AXU–LLI as per published routing',
        'Eleven nights hand-picked heritage hotels & boutique lodges (double occupancy)',
        'Daily breakfast; six lunches and eight dinners at trusted restaurant partners',
        'All park, church, and palace entrance fees on the published itinerary',
        'Professional English-speaking cultural guide plus site-specific specialist hosts',
        'Filtered water station on vehicle; arrival meet-and-greet at first airport',
        '24/7 Dorze Tours duty phone for logistics emergencies',
    ],
    excluded: [
        'International airfare to/from Ethiopia',
        'Ethiopian e-visa fees and travel insurance',
        'Premium alcoholic beverages and personal laundry',
        'Camera/video permits where churches request additional donations',
        'Tips for guides, drivers, and lodge staff (industry-standard gratuities)',
        'Optional extensions (Simien trekking add-on, community workshops)',
    ],
    highlights: [
        'Two UNESCO clusters: Lalibela rock churches & Gondar Royal Enclosure',
        'Lake Tana boat excursion with illuminated manuscript libraries',
        'Blue Nile Falls trekking approach with seasonal mist viewpoints',
        'Axum stelae field at golden hour with archaeology briefing',
        'Ethiopian coffee ceremony hosted in a Lalibela courtyard home',
    ],
    accommodations: [
        {
            destination: 'Bahir Dar',
            hotelCategory: '4-star lakeside',
            hotelOptions: [{ name: 'Kuriftu Resort & Spa Lake Tana', notes: 'Lake-view rooms, spa access' }],
        },
        {
            destination: 'Gondar',
            hotelCategory: 'boutique heritage',
            hotelOptions: [{ name: 'Goha Hotel', notes: 'Castle panoramas from terrace restaurant' }],
        },
        {
            destination: 'Axum',
            hotelCategory: '4-star business comfort',
            hotelOptions: [{ name: 'Sabean International Hotel', notes: 'Central location near stelae park' }],
        },
        {
            destination: 'Lalibela',
            hotelCategory: 'luxury lodge',
            hotelOptions: [
                { name: 'Maribela Hotel', notes: 'Walking distance to northern church cluster' },
                { name: 'Mountain View Hotel Lalibela', notes: 'Sunrise balcony suites on request' },
            ],
        },
    ],
    transportSegments: [
        { type: 'flight', route: 'Addis Ababa (ADD) → Bahir Dar (BDQ)', vehicleType: 'Scheduled domestic flight' },
        { type: 'boat', route: 'Lake Tana monastery circuit', vehicleType: 'Fiberglass excursion boat with life jackets' },
        { type: 'road', route: 'Bahir Dar → Gondar', vehicleType: 'Toyota Land Cruiser 4WD' },
        { type: 'flight', route: 'Gondar → Lalibela', vehicleType: 'Scheduled domestic flight (routing may vary)' },
        { type: 'road', route: 'Airport transfers & touring legs', vehicleType: 'Private 4WD with dedicated driver' },
    ],
    depositPercent: 25,
    cancellationPolicy:
        'Deposits are refundable up to 90 days before departure minus a $250 administration fee per person. 60–89 days: 50% refund of monies paid beyond deposit; 45–59 days: 25% refund; inside 44 days non-refundable unless replaced by another traveler subject to lodge penalties.',
    childDiscountRules:
        'Children 6–12 sharing with two adults receive published child-policy discount on base package price; infants under 5 sharing parents’ room pay domestic flight taxes only.',
    addons: [
        { name: 'Private airport VIP meet in Addis', price: 185, optional: true, description: 'Fast-track greeting, luggage assist, lounge access when available' },
        { name: 'Premium wine pairing dinners (set of three evenings)', price: 240, optional: true, description: 'Chef-selected Ethiopian fusion menus with sommelier notes' },
        { name: 'Professional photography mentoring day', price: 320, optional: true, description: 'Golden-hour coaching at Lalibela with edited preview gallery' },
        { name: 'Domestic flight upgrade to Cloud Nine flex fares', price: 410, optional: true, description: 'Priority boarding & extra baggage on internal legs when inventory permits' },
        { name: 'Amharic phrasebook & SIM starter kit', price: 65, optional: true, description: 'Unlocked local SIM with 10 GB data delivered day one' },
    ],
    guideRequired: true,
    vehicleRequired: true,
    hotelRequired: true,
    coverImage: IMG.lalibela,
    gallery: [IMG.heroNorth, IMG.gallery1, IMG.gallery2, IMG.gallery3],
    imageUrl: [IMG.lalibela, IMG.heroNorth],
    metaTitle: '12-Day Historic North Ethiopia Tour | Lalibela, Axum & Lake Tana | Dorze Tours',
    metaDescription:
        'Walk Lalibela’s rock-hewn churches, Axum’s ancient stelae, and Gondar’s castles on a twelve-day guided circuit with premium lodges, ethical pacing, and Dorze Tours logistics.',
    averageRating: 4.87,
    totalRatings: 142,
    itinerary: [
        itineraryDay({
            day: 1,
            title: 'Arrival in Addis Ababa — Highlands Welcome',
            description:
                'Land at Bole International Airport where our airport representative assists with baggage and transfers you to a serene garden hotel near the diplomatic quarter. Enjoy a welcome dinner briefing covering altitude adjustment, northern history timeline, and photography etiquette around active churches.',
            activities: [
                activity('14:00', 'Hotel check-in & refresh'),
                activity('17:30', 'Orientation lecture', 'Overview of Axumite, Zagwe, and Solomonic narratives'),
                activity('19:30', 'Welcome dinner', 'Introductory tasting menu featuring injera and regional vegetarian platters'),
            ],
            mealsIncluded: ['Dinner'],
            overnight: 'Addis Ababa — boutique hotel',
            accommodationLevel: '4-star boutique',
        }),
        itineraryDay({
            day: 2,
            title: 'Fly to Bahir Dar — Lake Tana Monasteries',
            description:
                'Morning flight to Bahir Dar on the southern shore of Lake Tana. Board a private boat bound for centuries-old island monasteries sheltering vivid murals and parchment treasures. Learn how monastic communities preserved Orthodoxy through centuries of political change.',
            activities: [
                activity('09:30', 'Domestic flight ADD–BDQ'),
                activity('14:00', 'Boat excursion to Zege Peninsula monasteries'),
                activity('18:00', 'Sunset lakeside stroll along the malefiya promenade'),
            ],
            mealsIncluded: ['Breakfast', 'Lunch'],
            overnight: 'Bahir Dar — lakeside resort',
            accommodationLevel: '4-star resort',
        }),
        itineraryDay({
            day: 3,
            title: 'Blue Nile Falls & Drive to Gondar',
            description:
                'Walk to the effervescent Tis Issat falls when water levels allow, crossing the historic Portuguese bridge. After lunch, wind through fertile countryside toward Gondar, the seventeenth-century capital whose castles fuse European masonry with Ethiopian defensive logic.',
            activities: [
                activity('08:00', 'Trek to Blue Nile Falls viewpoints'),
                activity('13:30', 'Scenic drive Bahir Dar → Gondar'),
                activity('17:30', 'Castle district exterior photo walk'),
            ],
            mealsIncluded: ['Breakfast', 'Dinner'],
            overnight: 'Gondar — heritage hotel',
            accommodationLevel: '4-star heritage',
        }),
        itineraryDay({
            day: 4,
            title: 'Gondar Royal Enclosure & Bathing Palace',
            description:
                'Full immersion inside Fasilides’ castle compound: banquet halls, lion cages turned libraries, and the sunken bathing palace still activated during Timkat. Your guide connects imperial narratives to modern Ethiopian identity before a craft workshop featuring religious paintings on goatskin.',
            activities: [
                activity('09:00', 'Guided castle circuit & museum artifacts'),
                activity('14:30', 'Traditional painting atelier visit'),
                activity('19:00', 'Optional jazz evening in Piassa quarter'),
            ],
            mealsIncluded: ['Breakfast', 'Lunch'],
            overnight: 'Gondar — heritage hotel',
            accommodationLevel: '4-star heritage',
        }),
        itineraryDay({
            day: 5,
            title: 'Simien Foothills Outlook — Debark Gateway',
            description:
                'Ascend toward Simien Mountains National Park gateway for panoramic escarpment vistas without committing to multi-day trekking. Spot gelada baboons along cliff trails, enjoy a picnic lunch, then descend to Axum-bound routing discussions.',
            activities: [
                activity('07:30', 'Drive to Debark park headquarters'),
                activity('11:00', 'Short escarpment hike with ranger escort'),
                activity('16:30', 'Return to Gondar for flight prep'),
            ],
            mealsIncluded: ['Breakfast', 'Lunch', 'Dinner'],
            overnight: 'Gondar — heritage hotel',
            accommodationLevel: '4-star heritage',
        }),
        itineraryDay({
            day: 6,
            title: 'Fly to Axum — Stelae Fields & Ark Traditions',
            description:
                'Morning flight to Axum, reputed heart of the Axumite Empire. Walk among towering granite obelisks, explore underground royal tombs, and discuss living traditions surrounding the sanctified chapel precinct (exterior respectful circuit). Afternoon coffee with a Tigray historian.',
            activities: [
                activity('08:45', 'Flight GDQ–AXU'),
                activity('11:30', 'Northern stelae park guided circuit'),
                activity('16:00', 'Coffee dialogue on Tigray heritage resilience'),
            ],
            mealsIncluded: ['Breakfast', 'Dinner'],
            overnight: 'Axum — upper mid-range hotel',
            accommodationLevel: '4-star hotel',
        }),
        itineraryDay({
            day: 7,
            title: 'Ancient Quarry & Monastery of Axum',
            description:
                'Morning visit to the unfinished Great Stela quarry illustrating imperial ambition halted mid-carving. Continue to monastery viewpoints overlooking agricultural plains. Evening leisure for journaling or spa time.',
            activities: [
                activity('09:00', 'Quarry archaeology walk-through'),
                activity('15:30', 'Optional spa massage booking via concierge'),
            ],
            mealsIncluded: ['Breakfast', 'Lunch'],
            overnight: 'Axum — upper mid-range hotel',
            accommodationLevel: '4-star hotel',
        }),
        itineraryDay({
            day: 8,
            title: 'Flight to Lalibela — Twilight Orientation',
            description:
                'Fly into Lalibela’s mountain aerodrome and settle into cliff-view lodging. Gentle orientation walk along ridge paths previews tomorrow’s sacred immersion; candlelight vigil glimpses remind visitors of devotional rhythms.',
            activities: [
                activity('10:30', 'Flight AXU–LLI'),
                activity('16:00', 'Sunset ridge orientation walk'),
                activity('20:00', 'Briefing on church etiquette & modest dress'),
            ],
            mealsIncluded: ['Breakfast', 'Dinner'],
            overnight: 'Lalibela — lodge',
            accommodationLevel: 'Upscale lodge',
        }),
        itineraryDay({
            day: 9,
            title: 'Northern Lalibela Cluster — Bet Giyorgis Crown Jewel',
            description:
                'Spend the day among rock-hewn sanctuaries carved top-down from living tuff. Marvel at Bet Medhane Alem’s scale and descend toward cross-shaped Bet Giyorgis, photographing evolving light angles while respecting active liturgy schedules.',
            activities: [
                activity('06:30', 'Optional dawn procession observation'),
                activity('09:30', 'Northern cluster interpretive circuit'),
                activity('15:00', 'Bet Giyorgis golden-hour photography window'),
            ],
            mealsIncluded: ['Breakfast', 'Lunch'],
            overnight: 'Lalibela — lodge',
            accommodationLevel: 'Upscale lodge',
        }),
        itineraryDay({
            day: 10,
            title: 'Southern Lalibela Cluster & Community Lunch',
            description:
                'Explore interconnected tunnels linking Bet Gabriel-Rufael and Bet Merkorios. Share a curated injera feast inside a family compound, supporting women-led cooperative kitchens while hearing oral histories tying Zagwe ingenuity to contemporary faith.',
            activities: [
                activity('09:00', 'Southern cluster tunnels & crypt passages'),
                activity('13:00', 'Community-hosted lunch experience'),
                activity('17:30', 'Traditional dance demonstration'),
            ],
            mealsIncluded: ['Breakfast', 'Lunch', 'Dinner'],
            overnight: 'Lalibela — lodge',
            accommodationLevel: 'Upscale lodge',
        }),
        itineraryDay({
            day: 11,
            title: 'Market Morning & Farewell Gala',
            description:
                'Stroll vibrant Saturday markets for spices, textiles, and silver crosses before a gala dinner celebrating guides, drivers, and artisans who shaped your journey. Packaging workshop explains carbon-offset contributions reinvested locally.',
            activities: [
                activity('09:30', 'Guided market immersion'),
                activity('14:00', 'Atelier visits with ethical purchasing guidelines'),
                activity('19:30', 'Farewell gala dinner & certificates'),
            ],
            mealsIncluded: ['Breakfast', 'Dinner'],
            overnight: 'Lalibela — lodge',
            accommodationLevel: 'Upscale lodge',
        }),
        itineraryDay({
            day: 12,
            title: 'Departure — Fly to Addis or onward',
            description:
                'Transfer to Lalibela airport for flights back to Addis Ababa or international connections. Optional day-room in Addis available for evening departures (supplement applies). Your Dorze concierge emails a personalized digital itinerary archive within 48 hours.',
            activities: [
                activity('07:00', 'Breakfast & luggage sweep'),
                activity('09:30', 'Airport escort & check-in assistance'),
            ],
            mealsIncluded: ['Breakfast'],
            overnight: 'Departure',
            accommodationLevel: 'n/a',
        }),
    ],
};
