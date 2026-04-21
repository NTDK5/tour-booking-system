import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db';
import Staff from '../modules/staff/models/staff.model';
import { seedStaffMembers } from './seeders/staffSeeder';

async function run() {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not set. Add it to Backend/.env');
        process.exit(1);
    }

    await connectDB();

    console.log('Seeding staff members...');
    const seeded = await seedStaffMembers();
    const total = await Staff.countDocuments();

    console.log(`✅ Staff seeding complete. Inserted: ${seeded.length}, Total staff records: ${total}`);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(async (err) => {
    console.error(err);
    try {
        await mongoose.disconnect();
    } catch {
        // noop
    }
    process.exit(1);
});
