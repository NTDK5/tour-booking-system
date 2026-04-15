import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from '../models/destinationModel';
import Activity from '../models/activityModel';
import Itinerary from '../models/itineraryModel';

dotenv.config();

const destinations = [
    {
        name: 'Lalibela',
        description: 'Famous for its rock-hewn monolithic churches, a UNESCO World Heritage site and a center of pilgrimage.',
        region: 'Amhara',
        images: ['https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=800'],
        isActive: true
    },
    {
        name: 'Simien Mountains',
        description: 'Majestic mountain range with spectacular landscapes and unique endemic wildlife like the Gelada baboon.',
        region: 'Amhara',
        images: ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?q=80&w=800'],
        isActive: true
    },
    {
        name: 'Omo Valley',
        description: 'Home to diverse ethnic groups with rich cultural traditions and unique ways of life.',
        region: 'South Ethiopia',
        images: ['https://images.unsplash.com/photo-1523805081446-ed9a768f780d?q=80&w=800'],
        isActive: true
    },
    {
        name: 'Axum',
        description: 'Ancient capital of the Aksumite Empire, known for its towering obelisks and religious significance.',
        region: 'Tigray',
        images: ['https://images.unsplash.com/photo-1545562083-a600704fa487?q=80&w=800'],
        isActive: true
    },
    {
        name: 'Gonder',
        description: 'The "Camelot of Africa," famous for its 17th-century castles and imperial fortress Fasil Ghebbi.',
        region: 'Amhara',
        images: ['https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?q=80&w=800'],
        isActive: true
    },
    {
        name: 'Danakil Depression',
        description: 'One of the lowest and hottest places on Earth, featuring colorful salt lakes and active volcanoes.',
        region: 'Afar',
        images: ['https://images.unsplash.com/photo-1518414922594-54070a98336d?q=80&w=800'],
        isActive: true
    },
    {
        name: 'Harar',
        description: 'A walled city known as the "City of Saints," famous for its maze-like alleys and hyena feeding tradition.',
        region: 'Harari',
        images: ['https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=800'],
        isActive: true
    },
    {
        name: 'Bale Mountains',
        description: 'High-altitude plateau with diverse ecosystems, home to the rare Ethiopian wolf.',
        region: 'Oromia',
        images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800'],
        isActive: true
    },
    {
        name: 'Lake Tana',
        description: 'The source of the Blue Nile, featuring ancient island monasteries and rich birdlife.',
        region: 'Amhara',
        images: ['https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800'],
        isActive: true
    },
    {
        name: 'Addis Ababa',
        description: 'The vibrant capital city, blending modern urban life with deeply rooted history and culture.',
        region: 'Addis Ababa',
        images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800'],
        isActive: true
    }
];

const destinationActivities: Record<string, Array<{ title: string; description: string; category: 'culture' | 'nature' | 'adventure' | 'historical'; duration: string }>> = {
    'Lalibela': [
        { title: 'Bete Giyorgis Church Visit', description: 'Explore the iconic cross-shaped rock-hewn church with a local guide.', category: 'historical', duration: '2 Hours' },
        { title: 'Lalibela Pilgrimage Route Walk', description: 'Walk through sacred tunnels and connecting passages between churches.', category: 'culture', duration: '3 Hours' },
        { title: 'Traditional Coffee Ceremony', description: 'Join a local family for an authentic Ethiopian coffee ceremony.', category: 'culture', duration: '1.5 Hours' },
        { title: 'Asheton Maryam Monastery Hike', description: 'Hike to the hilltop monastery for panoramic views of Lalibela.', category: 'adventure', duration: '4 Hours' },
        { title: 'Sunset at Lalibela Highlands', description: 'Enjoy a scenic sunset overlooking the dramatic highland landscape.', category: 'nature', duration: '2 Hours' },
    ],
    'Simien Mountains': [
        { title: 'Gelada Baboon Tracking', description: 'Observe endemic Gelada baboons in their natural cliffside habitat.', category: 'nature', duration: '3 Hours' },
        { title: 'Sankaber Escarpment Trek', description: 'Guided trek along spectacular escarpments and viewpoints.', category: 'adventure', duration: '6 Hours' },
        { title: 'Jinbar Waterfall Hike', description: 'Moderate hike to one of the park’s most scenic waterfalls.', category: 'adventure', duration: '5 Hours' },
        { title: 'Birdwatching in Simien NP', description: 'Spot endemic and migratory highland bird species with a ranger.', category: 'nature', duration: '3 Hours' },
        { title: 'Sunrise at Buyit Ras', description: 'Early morning viewpoint experience with mountain silhouettes.', category: 'nature', duration: '2 Hours' },
    ],
    'Omo Valley': [
        { title: 'Hamar Village Cultural Visit', description: 'Learn about Hamar traditions, dress, and daily life.', category: 'culture', duration: '3 Hours' },
        { title: 'Mursi Market Experience', description: 'Visit a local market and meet Mursi artisans and traders.', category: 'culture', duration: '4 Hours' },
        { title: 'Karo Tribe Riverbank Walk', description: 'Walk along the Omo River and discover Karo body-paint traditions.', category: 'culture', duration: '3 Hours' },
        { title: 'Konso Terraces Exploration', description: 'Explore ancient terracing and stone-walled settlements.', category: 'historical', duration: '4 Hours' },
        { title: 'Sunset Over Omo Plains', description: 'Scenic evening drive across the valley landscapes.', category: 'nature', duration: '2 Hours' },
    ],
    'Axum': [
        { title: 'Axum Obelisks Archaeological Tour', description: 'Discover the famous stelae field and ancient imperial history.', category: 'historical', duration: '2.5 Hours' },
        { title: 'St. Mary of Zion Church Visit', description: 'Visit one of Ethiopia’s most important religious sites.', category: 'culture', duration: '2 Hours' },
        { title: 'Queen of Sheba Palace Ruins', description: 'Explore the ruins linked to legendary Axumite history.', category: 'historical', duration: '2 Hours' },
        { title: 'Axum Museum Guided Walk', description: 'View archaeological artifacts and royal-era relics.', category: 'historical', duration: '1.5 Hours' },
        { title: 'Evening City Heritage Walk', description: 'Relaxed walk through old Axum neighborhoods and markets.', category: 'culture', duration: '2 Hours' },
    ],
    'Gonder': [
        { title: 'Fasil Ghebbi Castle Complex Tour', description: 'Visit the royal enclosure known as the Camelot of Africa.', category: 'historical', duration: '3 Hours' },
        { title: 'Debre Berhan Selassie Church Visit', description: 'See the famous angel-ceiling paintings and murals.', category: 'historical', duration: '2 Hours' },
        { title: 'Gonder City Walking Tour', description: 'Explore historic streets, piazzas, and local cafes.', category: 'culture', duration: '2.5 Hours' },
        { title: 'Kuskuam Monastery Excursion', description: 'Discover Empress Mentewab’s former palace and monastery grounds.', category: 'historical', duration: '2 Hours' },
        { title: 'Traditional Music Night', description: 'Enjoy live Ethiopian music and dance in a cultural venue.', category: 'culture', duration: '2 Hours' },
    ],
    'Danakil Depression': [
        { title: 'Dallol Hydrothermal Field Tour', description: 'Witness colorful mineral formations and salt terraces.', category: 'nature', duration: '4 Hours' },
        { title: 'Erta Ale Volcano Trek', description: 'Overnight trek to the lava lake viewpoint with guides.', category: 'adventure', duration: '8 Hours' },
        { title: 'Lake Assale Salt Flats Walk', description: 'Visit working salt extraction sites on vast salt plains.', category: 'nature', duration: '3 Hours' },
        { title: 'Camel Caravan Observation', description: 'See traditional Afar salt caravan transport routes.', category: 'culture', duration: '2 Hours' },
        { title: 'Afar Campfire Cultural Evening', description: 'Share stories and food with local Afar hosts.', category: 'culture', duration: '2 Hours' },
    ],
    'Harar': [
        { title: 'Jugol Old Town Walking Tour', description: 'Explore UNESCO-listed walled city alleys and gates.', category: 'historical', duration: '3 Hours' },
        { title: 'Harar Hyena Feeding Experience', description: 'Watch the famous nighttime hyena feeding tradition.', category: 'culture', duration: '1.5 Hours' },
        { title: 'Arthur Rimbaud House Museum', description: 'Visit the poet’s former residence and museum collection.', category: 'historical', duration: '1.5 Hours' },
        { title: 'Local Market & Basket Weaving Visit', description: 'See colorful market life and Harari craft traditions.', category: 'culture', duration: '2 Hours' },
        { title: 'Harar Tea House Tasting', description: 'Sample local tea and snacks in historic cafes.', category: 'culture', duration: '1 Hour' },
    ],
    'Bale Mountains': [
        { title: 'Sanetti Plateau Drive', description: 'High-altitude drive spotting Ethiopian wolves and mountain nyala.', category: 'nature', duration: '4 Hours' },
        { title: 'Harenna Forest Nature Walk', description: 'Guided walk through cloud forest with birdwatching.', category: 'nature', duration: '3 Hours' },
        { title: 'Sof Omar Caves Exploration', description: 'Visit dramatic limestone cave passages and river chambers.', category: 'adventure', duration: '4 Hours' },
        { title: 'Tulu Dimtu Summit Hike', description: 'Trek to one of Ethiopia’s highest accessible peaks.', category: 'adventure', duration: '6 Hours' },
        { title: 'Bale Wildlife Photography Session', description: 'Dedicated wildlife observation and photography outing.', category: 'nature', duration: '3 Hours' },
    ],
    'Lake Tana': [
        { title: 'Island Monasteries Boat Tour', description: 'Boat trip to historic monasteries with religious art collections.', category: 'historical', duration: '5 Hours' },
        { title: 'Blue Nile Falls Excursion', description: 'Visit Tis Issat waterfall and surrounding viewpoints.', category: 'nature', duration: '4 Hours' },
        { title: 'Bahir Dar Lakeside Cycling', description: 'Cycle along the lakeshore and city promenade.', category: 'adventure', duration: '2 Hours' },
        { title: 'Traditional Papyrus Boat Demonstration', description: 'Learn about local papyrus boat craftsmanship.', category: 'culture', duration: '1.5 Hours' },
        { title: 'Lake Tana Birdwatching Cruise', description: 'Spot pelicans, kingfishers, and wetland birds by boat.', category: 'nature', duration: '3 Hours' },
    ],
    'Addis Ababa': [
        { title: 'National Museum Guided Tour', description: 'See Lucy and key Ethiopian archaeological exhibits.', category: 'historical', duration: '2 Hours' },
        { title: 'Merkato Cultural Walk', description: 'Explore one of Africa’s largest open-air markets.', category: 'culture', duration: '3 Hours' },
        { title: 'Entoto Hills Viewpoint Visit', description: 'Scenic drive and walk with panoramic city views.', category: 'nature', duration: '2.5 Hours' },
        { title: 'Ethnological Museum Tour', description: 'Learn about Ethiopia’s cultures and imperial history.', category: 'historical', duration: '2 Hours' },
        { title: 'Jazz Club Evening Experience', description: 'Enjoy Addis Ababa’s modern Ethio-jazz nightlife scene.', category: 'culture', duration: '2.5 Hours' },
    ],
};

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dorze_tours');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data (optional, but requested for clean slate)
        await Destination.deleteMany({});
        await Activity.deleteMany({});
        await Itinerary.deleteMany({});

        for (const destData of destinations) {
            const destination = await Destination.create(destData);
            console.log(`Created Destination: ${destination.name}`);

            const sourceActivities = destinationActivities[destination.name] || [];
            const activities = sourceActivities.map((activity) => ({
                ...activity,
                destination: destination._id,
                isActive: true
            }));
            const createdActivities = await Activity.insertMany(activities);
            console.log(`Seeded ${createdActivities.length} activities for ${destination.name}`);

            const popularItineraries = [
                {
                    destination: destination._id,
                    title: `${destination.name} Highlights Day`,
                    summary: `A curated popular day itinerary covering the best of ${destination.name}.`,
                    activities: createdActivities.slice(0, 3).map((a: any) => a._id),
                    dayType: 'mixed',
                    durationHours: 8,
                    price: Math.floor(120 + Math.random() * 100),
                    isPopular: true,
                    isActive: true
                },
                {
                    destination: destination._id,
                    title: `${destination.name} Culture & Nature Mix`,
                    summary: `A premium one-day cultural and nature blend in ${destination.name}.`,
                    activities: createdActivities.slice(3, 6).map((a: any) => a._id),
                    dayType: 'culture',
                    durationHours: 9,
                    price: Math.floor(150 + Math.random() * 120),
                    isPopular: true,
                    isActive: true
                }
            ];

            await Itinerary.insertMany(popularItineraries);
            console.log(`Seeded 2 popular itineraries for ${destination.name}`);
        }

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
