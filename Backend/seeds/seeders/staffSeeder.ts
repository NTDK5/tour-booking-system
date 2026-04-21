import Staff from '../../modules/staff/models/staff.model';

export const STAFF_SEEDS = [
    {
        fullName: 'Abebe Tadesse',
        email: 'abebe.guide@dorzetours.com',
        phone: '+251911000101',
        role: 'guide',
        availability: 'available',
        status: 'active',
        skills: {
            languages: ['Amharic', 'English'],
            destinations: ['Lalibela', 'Gondar', 'Bahir Dar'],
            certifications: ['National Tour Guide License'],
        },
        hireDate: new Date('2022-02-10'),
        notes: 'Senior cultural guide for northern route departures.',
    },
    {
        fullName: 'Marta Bekele',
        email: 'marta.guide@dorzetours.com',
        phone: '+251911000102',
        role: 'guide',
        availability: 'assigned',
        status: 'active',
        currentAssignmentsCount: 1,
        lastAssignedAt: new Date(),
        skills: {
            languages: ['Amharic', 'English', 'French'],
            destinations: ['Addis Ababa', 'Omo Valley', 'Arba Minch'],
            certifications: ['Community Tourism Guide'],
        },
        hireDate: new Date('2021-08-04'),
        notes: 'Strong guest feedback for southern cultural trips.',
    },
    {
        fullName: 'Yonas Haile',
        email: 'yonas.driver@dorzetours.com',
        phone: '+251911000103',
        role: 'driver',
        availability: 'available',
        status: 'active',
        skills: {
            licenseTypes: ['D1', 'D2'],
            vehicleTypes: ['4x4', 'Minibus'],
            certifications: ['Defensive Driving'],
        },
        hireDate: new Date('2020-05-18'),
        notes: 'Long-haul overland and mountain route specialist.',
    },
    {
        fullName: 'Selam Wondimu',
        email: 'selam.driver@dorzetours.com',
        phone: '+251911000104',
        role: 'driver',
        availability: 'on_leave',
        status: 'active',
        skills: {
            licenseTypes: ['D1'],
            vehicleTypes: ['SUV'],
        },
        hireDate: new Date('2023-01-09'),
        notes: 'Currently on approved leave.',
    },
    {
        fullName: 'Hana Gebre',
        email: 'hana.coordinator@dorzetours.com',
        phone: '+251911000105',
        role: 'coordinator',
        availability: 'available',
        status: 'active',
        skills: {
            departments: ['Operations', 'Logistics'],
            languages: ['Amharic', 'English'],
        },
        hireDate: new Date('2019-11-21'),
        notes: 'Handles departure logistics and supplier coordination.',
    },
    {
        fullName: 'Rahel Alemu',
        email: 'rahel.translator@dorzetours.com',
        phone: '+251911000106',
        role: 'translator',
        availability: 'available',
        status: 'active',
        skills: {
            languages: ['Amharic', 'English', 'German', 'Italian'],
        },
        hireDate: new Date('2022-06-14'),
        notes: 'Supports multilingual custom and VIP itineraries.',
    },
    {
        fullName: 'Daniel Mekonnen',
        email: 'daniel.support@dorzetours.com',
        phone: '+251911000107',
        role: 'support',
        availability: 'unavailable',
        status: 'inactive',
        skills: {
            departments: ['Guest Support'],
            languages: ['Amharic', 'English'],
        },
        hireDate: new Date('2018-03-01'),
        notes: 'Archived example staff profile for inactive state testing.',
    },
] as const;

export async function seedStaffMembers() {
    const emails = STAFF_SEEDS.map((s) => s.email);
    await Staff.deleteMany({ email: { $in: emails } });
    return Staff.insertMany(STAFF_SEEDS);
}
