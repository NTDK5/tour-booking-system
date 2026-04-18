import mongoose from 'mongoose';
import Lodge from '../../models/lodgeModel';
import Car from '../../models/carModel';
import Resource from '../../models/resourceModel';
import { IMG } from '../data/mediaAssets';

export async function seedLodgesCarsAndResources() {
    await Lodge.deleteMany({});
    await Car.deleteMany({});
    await Resource.deleteMany({});

    const lodges = await Lodge.insertMany([
        {
            name: 'Kuriftu Resort & Spa Lake Tana',
            location: 'Bahir Dar, Ethiopia',
            description:
                'Sprawling lakeside resort with spa wing, infinity pools overlooking Lake Tana, and curated Ethiopian tasting menus paired with Tej honey wine.',
            amenities: ['Spa', 'Infinity pool', 'Private marina', 'Conference wing'],
            images: [IMG.lodge, IMG.gallery2],
            roomTypes: [
                {
                    type: 'Lake View Deluxe',
                    price: 210,
                    amenities: ['King bed', 'Balcony', 'Rain shower'],
                    availableRooms: 14,
                },
                {
                    type: 'Garden Suite',
                    price: 175,
                    amenities: ['Twin or king', 'Outdoor lounge'],
                    availableRooms: 10,
                },
            ],
            contactInfo: { phone: '+251911000111', email: 'reservations@kuriftu.et' },
        },
        {
            name: 'Goha Hotel Gondar',
            location: 'Gondar, Ethiopia',
            description:
                'Terraced heritage hotel framing Royal Enclosure sunsets; beloved by photographers for elevated castle panoramas.',
            amenities: ['Castle-view terrace', 'Chef’s table', 'Craft boutique'],
            images: [IMG.gallery3, IMG.heroNorth],
            roomTypes: [
                {
                    type: 'Castle Panorama Room',
                    price: 155,
                    amenities: ['Castle view', 'Heritage décor'],
                    availableRooms: 22,
                },
            ],
            contactInfo: { phone: '+251921000222', email: 'stay@gohahotel.et' },
        },
        {
            name: 'Bale Mountain Lodge',
            location: 'Bale Mountains National Park, Ethiopia',
            description:
                'Conservation-focused lodge anchoring wolf-tracking itineraries with biomass heating and researcher lecture nights.',
            amenities: ['Biomass heating', 'Observation deck', 'Natural history library'],
            images: [IMG.bale, IMG.gallery4],
            roomTypes: [
                {
                    type: 'Forest Chalet',
                    price: 265,
                    amenities: ['Wood stove', 'Bird-friendly glazing'],
                    availableRooms: 8,
                },
            ],
            contactInfo: { phone: '+251931000333', email: 'welcome@balemountain.et' },
        },
        {
            name: 'Paradise Lodge Arba Minch',
            location: 'Arba Minch, Ethiopia',
            description:
                'Twin-lake vistas from cliff-edge bungalows serving as staging point for Nech Sar & crocodile market excursions.',
            amenities: ['Twin lake overlook', 'Infinity pool', 'Zip-line nearby'],
            images: [IMG.omo, IMG.gallery1],
            roomTypes: [
                {
                    type: 'Rift Bungalow',
                    price: 189,
                    amenities: ['Outdoor shower', 'Fan-cooled'],
                    availableRooms: 18,
                },
            ],
            contactInfo: { phone: '+251941000444', email: 'hello@paradiselodge.et' },
        },
    ]);

    const cars = await Car.insertMany([
        {
            name: 'Northern Circuit Executive 01',
            brand: 'Toyota',
            carModel: 'Land Cruiser 300',
            year: 2023,
            transmission: 'Automatic',
            fuelType: 'Diesel',
            seats: 7,
            pricePerDay: 285,
            images: [IMG.vehicle],
            features: ['Roof hatches', 'Dual spare tires', 'Satellite messenger'],
            available: true,
            description:
                'Armored-skid plates, snorkel intake, refrigerated water crate—deployed on historic north & Simien circuits.',
            location: 'Addis Ababa logistics yard',
        },
        {
            name: 'Southern Cultural Convoy Lead',
            brand: 'Toyota',
            carModel: 'Land Cruiser 76',
            year: 2022,
            transmission: 'Manual',
            fuelType: 'Diesel',
            seats: 6,
            pricePerDay: 245,
            images: [IMG.vehicle],
            features: ['Winch', 'Sand ladders', 'HF radio'],
            available: true,
            description: 'Dedicated Omo Valley convoy lead vehicle with mechanic chase pairing.',
            location: 'Arba Minch depot',
        },
        {
            name: 'Safari Photo Rig Bale',
            brand: 'Toyota',
            carModel: 'Land Cruiser 79',
            year: 2021,
            transmission: 'Manual',
            fuelType: 'Diesel',
            seats: 5,
            pricePerDay: 265,
            images: [IMG.vehicle],
            features: ['Camera beanbags', 'Silence insulation', '220V inverter'],
            available: true,
            description: 'Optimized for silent wildlife approaches with rotating roof hatches.',
            location: 'Dinsho staging area',
        },
        {
            name: 'Danakil Expedition Support',
            brand: 'Toyota',
            carModel: 'Land Cruiser HZJ79',
            year: 2020,
            transmission: 'Manual',
            fuelType: 'Diesel',
            seats: 4,
            pricePerDay: 310,
            images: [IMG.vehicle],
            features: ['Dual fuel tanks', 'Desert tyres', 'Heavy-duty springs'],
            available: true,
            description: 'Heat-shielded rear deck for water & fuel redundancy on Afar routes.',
            location: 'Mekele convoy yard',
        },
    ]);

    const resources: any[] = [];

    for (const lodge of lodges) {
        resources.push({
            resourceType: 'Lodge',
            sourceModel: 'Lodge',
            sourceId: lodge._id as mongoose.Types.ObjectId,
            name: lodge.name,
            metadata: {
                destination: lodge.location,
                category: 'hotel',
                roomInventory: lodge.roomTypes?.length ?? 0,
            },
            constraints: { maxCapacity: 40, minLeadHours: 72 },
            isActive: true,
        });
    }

    for (const car of cars) {
        resources.push({
            resourceType: 'Car',
            sourceModel: 'Car',
            sourceId: car._id as mongoose.Types.ObjectId,
            name: car.name,
            metadata: {
                seats: car.seats,
                fuelType: car.fuelType,
                baseLocation: car.location,
            },
            constraints: { maxCapacity: car.seats, minLeadHours: 24 },
            isActive: car.available,
        });
    }

    resources.push(
        {
            resourceType: 'Guide',
            sourceModel: 'Custom',
            sourceId: new mongoose.Types.ObjectId(),
            name: 'Eskinder Bekele — Chief Cultural Interpreter',
            metadata: {
                languages: ['English', 'Amharic', 'French'],
                regions: ['Northern circuit', 'Lalibela'],
                certifications: ['Ministry of Tourism Grade I', 'UNESCO church etiquette trainer'],
                availabilityNotes: 'Prefers departures Tue–Thu; lectures on Zagwe dynasty.',
            },
            constraints: { maxCapacity: 12, minLeadHours: 168, requiresManualApproval: false },
            isActive: true,
        },
        {
            resourceType: 'Guide',
            sourceModel: 'Custom',
            sourceId: new mongoose.Types.ObjectId(),
            name: 'Hirut Mengistu — Simien Trek Lead',
            metadata: {
                languages: ['English', 'Amharic'],
                regions: ['Simien Mountains', 'Gondar'],
                certifications: ['Wilderness First Responder', 'Park scout co-license'],
                availabilityNotes: 'Summit rotations mid-month; Gelada behavioral specialty.',
            },
            constraints: { maxCapacity: 10, minLeadHours: 336 },
            isActive: true,
        },
        {
            resourceType: 'Guide',
            sourceModel: 'Custom',
            sourceId: new mongoose.Types.ObjectId(),
            name: 'Obsaa Jamal — Omo Valley Ethical Facilitation Lead',
            metadata: {
                languages: ['English', 'Amharic', 'Afan Oromo', 'Hamar basic'],
                regions: ['Lower Omo', 'Konso'],
                certifications: ['Anthropology BA', 'Community consent mediation'],
                availabilityNotes: 'Requires two-week notice for bull-jumping alignment.',
            },
            constraints: { maxCapacity: 8, minLeadHours: 240, requiresManualApproval: true },
            isActive: true,
        },
        {
            resourceType: 'Guide',
            sourceModel: 'Custom',
            sourceId: new mongoose.Types.ObjectId(),
            name: 'Selamawit Girma — Conservation Safari Naturalist',
            metadata: {
                languages: ['English', 'Amharic', 'Italian'],
                regions: ['Bale Mountains', 'Awash'],
                certifications: ['Ornithology diploma', 'Ethiopian wolf interpretation'],
                availabilityNotes: 'Pairs with researcher nights January–March.',
            },
            constraints: { maxCapacity: 9, minLeadHours: 120 },
            isActive: true,
        }
    );

    await Resource.insertMany(resources);

    return { lodges, cars };
}
