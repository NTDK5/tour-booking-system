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

const activityCategories: ('culture' | 'nature' | 'adventure' | 'historical')[] = ['culture', 'nature', 'adventure', 'historical'];

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

            const activities = [];
            for (let i = 1; i <= 10; i++) {
                activities.push({
                    title: `${destination.name} Experience ${i}`,
                    description: `A unique ${activityCategories[i % 4]} experience in the heart of ${destination.name}. This activity covers key highlights and hidden gems.`,
                    category: activityCategories[i % 4],
                    duration: `${Math.floor(Math.random() * 4) + 2} Hours`,
                    destination: destination._id,
                    isActive: true
                });
            }
            const createdActivities = await Activity.insertMany(activities);
            console.log(`Seeded 10 activities for ${destination.name}`);

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
