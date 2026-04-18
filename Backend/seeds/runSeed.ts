/**
 * Master database seed — Ethiopian premium tour packages, departures, bookings, and admin user.
 *
 * Usage (from Backend/):
 *   npx ts-node seeds/runSeed.ts
 *   npx ts-node seeds/runSeed.ts --force
 *
 * Env:
 *   MONGO_URI — required
 *   SEED_ADMIN_PASSWORD — default DorzeAdmin2026!
 *   SEED_CUSTOMER_PASSWORD — default DorzeTraveler2026!
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db';
import Tour from '../models/tourModel';
import Booking from '../models/bookingModel';
import User from '../models/userModel';
import Lodge from '../models/lodgeModel';
import Car from '../models/carModel';
import Resource from '../models/resourceModel';
import PackageDeparture from '../modules/packages/models/packageDepartureModel';
import { SEED_USER_EMAILS } from './constants';
import { seedAdminUsers, DEFAULT_ADMIN_EMAIL } from './seeders/adminSeeder';
import { seedCustomerUsers, DEFAULT_CUSTOMER_PASSWORD } from './seeders/customerSeeder';
import { seedLodgesCarsAndResources } from './seeders/resourceSeeder';
import { seedPackages } from './seeders/packageSeeder';
import { seedDepartures } from './seeders/departureSeeder';
import { seedBookings } from './seeders/bookingSeeder';

const force = process.argv.includes('--force');

async function purgeSeedCollections() {
    await Booking.deleteMany({});
    await PackageDeparture.deleteMany({});
    await Tour.deleteMany({});
    await Resource.deleteMany({});
    await Car.deleteMany({});
    await Lodge.deleteMany({});
    await User.deleteMany({ email: { $in: SEED_USER_EMAILS } });
}

async function run() {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not set. Add it to Backend/.env');
        process.exit(1);
    }

    await connectDB();

    const tourCount = await Tour.countDocuments();
    if (tourCount > 0 && !force) {
        console.error(
            'Database already contains tour packages. Refusing to duplicate seed data.\n' +
                'Use --force to wipe seeded collections (bookings, departures, tours, resources, cars, lodges, seed users) and re-run.'
        );
        process.exit(1);
    }

    if (force) {
        console.log('⚠️  --force: removing existing Dorze seed data (tours, departures, bookings, resources, seed users)…');
        await purgeSeedCollections();
    }

    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'DorzeAdmin2026!';
    const customerPassword = process.env.SEED_CUSTOMER_PASSWORD || DEFAULT_CUSTOMER_PASSWORD;

    console.log('Seeding admin user…');
    await seedAdminUsers(adminPassword);

    console.log('Seeding traveler accounts…');
    const customers = await seedCustomerUsers(customerPassword);

    console.log('Seeding lodges, fleet vehicles & unified resources (guides)…');
    await seedLodgesCarsAndResources();

    console.log('Seeding tour packages (6 flagship itineraries)…');
    const { byPackageCode } = await seedPackages();

    console.log('Seeding scheduled departures…');
    const { bySku } = await seedDepartures(byPackageCode);

    console.log('Seeding bookings (pending / confirmed / cancelled)…');
    await seedBookings({
        customers: customers as any,
        byPackageCode,
        departureBySku: bySku,
    });

    const pkgTotal = await Tour.countDocuments();
    const depTotal = await PackageDeparture.countDocuments();
    const bookTotal = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const confirmedRevenue = await Booking.aggregate([
        { $match: { status: 'confirmed', paymentStatus: 'paid' } },
        { $group: { _id: null, sum: { $sum: '$totalPrice' } } },
    ]);

    console.log('\n✅ Seed completed successfully.\n');
    console.log('Summary:');
    console.log(`  Packages (tours):     ${pkgTotal}`);
    console.log(`  Departures:           ${depTotal}`);
    console.log(`  Bookings (total):     ${bookTotal}`);
    console.log(`  Pending bookings:     ${pendingBookings}`);
    console.log(`  Confirmed bookings:   ${confirmedBookings}`);
    console.log(`  Paid revenue (confirmed, paid): USD ${confirmedRevenue[0]?.sum?.toFixed(2) ?? '0.00'}`);
    console.log('\nAdmin login:');
    console.log(`  Email:    ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('\nTraveler demo password (all seeded guests):');
    console.log(`  ${customerPassword}`);
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
