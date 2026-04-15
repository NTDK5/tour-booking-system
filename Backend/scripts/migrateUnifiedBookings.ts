import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db';
import Booking from '../models/bookingModel';
import Lodge from '../models/lodgeModel';
import Tour from '../models/tourModel';
import Car from '../models/carModel';
import Resource from '../models/resourceModel';

dotenv.config();

const DRY_RUN = process.argv.includes('--dry-run');

async function syncResources() {
    const [lodges, tours, cars] = await Promise.all([
        Lodge.find({}).lean(),
        Tour.find({}).lean(),
        Car.find({}).lean(),
    ]);

    const ops: any[] = [];
    lodges.forEach((lodge: any) => {
        ops.push({
            updateOne: {
                filter: { sourceModel: 'Lodge', sourceId: lodge._id },
                update: {
                    $set: {
                        resourceType: 'Lodge',
                        sourceModel: 'Lodge',
                        sourceId: lodge._id,
                        name: lodge.name || 'Unnamed Lodge',
                        metadata: { location: lodge.location, roomTypes: lodge.roomTypes || [] },
                        constraints: { maxCapacity: 20 },
                        isActive: true,
                    }
                },
                upsert: true,
            }
        });
    });
    tours.forEach((tour: any) => {
        ops.push({
            updateOne: {
                filter: { sourceModel: 'Tour', sourceId: tour._id },
                update: {
                    $set: {
                        resourceType: 'Tour',
                        sourceModel: 'Tour',
                        sourceId: tour._id,
                        name: tour.title || 'Unnamed Tour',
                        metadata: { destination: tour.destination, duration: tour.duration },
                        constraints: { maxCapacity: 20 },
                        isActive: true,
                    }
                },
                upsert: true,
            }
        });
    });
    cars.forEach((car: any) => {
        ops.push({
            updateOne: {
                filter: { sourceModel: 'Car', sourceId: car._id },
                update: {
                    $set: {
                        resourceType: 'Car',
                        sourceModel: 'Car',
                        sourceId: car._id,
                        name: `${car.brand || ''} ${car.carModel || car.model || ''}`.trim() || 'Unnamed Car',
                        metadata: { location: car.location, seats: car.seats },
                        constraints: { maxCapacity: 1 },
                        isActive: Boolean(car.available),
                    }
                },
                upsert: true,
            }
        });
    });

    if (!DRY_RUN && ops.length) {
        await Resource.bulkWrite(ops);
    }

    return {
        resourceOpsPrepared: ops.length,
        lodges: lodges.length,
        tours: tours.length,
        cars: cars.length,
    };
}

async function backfillBookings() {
    const bookings = await Booking.find({}).select('_id tour lodge car bookingDate checkInDate checkOutDate resource startDate endDate').lean();
    let updatedCount = 0;
    let skippedCount = 0;
    let invalidCount = 0;
    const ops: any[] = [];

    for (const booking of bookings as any[]) {
        const resourceId = booking?.resource?.resourceId || booking.tour || booking.lodge || booking.car;
        const resourceType = booking?.resource?.resourceType ||
            (booking.tour ? 'Tour' : booking.lodge ? 'Lodge' : booking.car ? 'Car' : undefined);

        if (!resourceId || !resourceType) {
            invalidCount += 1;
            continue;
        }

        const startDate = booking.startDate || booking.checkInDate || booking.bookingDate;
        const endDate = booking.endDate || booking.checkOutDate || booking.checkInDate || booking.bookingDate;

        if (!startDate || !endDate) {
            invalidCount += 1;
            continue;
        }

        const needsUpdate =
            !booking.resource?.resourceId ||
            !booking.startDate ||
            !booking.endDate;

        if (!needsUpdate) {
            skippedCount += 1;
            continue;
        }

        updatedCount += 1;
        ops.push({
            updateOne: {
                filter: { _id: booking._id },
                update: {
                    $set: {
                        resource: { resourceId, resourceType },
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                    }
                }
            }
        });
    }

    if (!DRY_RUN && ops.length) {
        await Booking.bulkWrite(ops);
    }

    return { updatedCount, skippedCount, invalidCount, bookingOpsPrepared: ops.length };
}

async function run() {
    try {
        await connectDB();
        const resourceSummary = await syncResources();
        const bookingSummary = await backfillBookings();

        console.log('Unified migration summary:', {
            dryRun: DRY_RUN,
            ...resourceSummary,
            ...bookingSummary,
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

run();
