import User from '../../models/userModel';

export const CUSTOMER_SEEDS = [
    {
        fullName: 'Claire Delgado',
        first_name: 'Claire',
        last_name: 'Delgado',
        email: 'claire.delgado@travelers.co.uk',
        country: 'United Kingdom',
    },
    {
        fullName: 'Marcus Wei',
        first_name: 'Marcus',
        last_name: 'Wei',
        email: 'marcus.wei@example.com',
        country: 'Singapore',
    },
    {
        fullName: 'Isabelle Fontaine',
        first_name: 'Isabelle',
        last_name: 'Fontaine',
        email: 'isabelle.fontaine@voyage.fr',
        country: 'France',
    },
    {
        fullName: 'Jonas Ødegård',
        first_name: 'Jonas',
        last_name: 'Ødegård',
        email: 'jonas.odegard@fjordmail.no',
        country: 'Norway',
    },
    {
        fullName: 'Priya Narayan',
        first_name: 'Priya',
        last_name: 'Narayan',
        email: 'priya.narayan@nomadlabs.in',
        country: 'India',
    },
    {
        fullName: 'Ethan Brooks',
        first_name: 'Ethan',
        last_name: 'Brooks',
        email: 'ethan.brooks@urbanfield.us',
        country: 'United States',
    },
] as const;

/** Shared demo password for all seeded customers — change after first login */
export const DEFAULT_CUSTOMER_PASSWORD = 'DorzeTraveler2026!';

export async function seedCustomerUsers(customerPasswordPlain: string) {
    const emails = CUSTOMER_SEEDS.map((c) => c.email);
    await User.deleteMany({ email: { $in: emails } });

    const users = [];
    for (const c of CUSTOMER_SEEDS) {
        users.push(
            await User.create({
                ...c,
                password: customerPasswordPlain,
                role: 'user',
                verified: true,
                permissions: [],
                status: 'active',
            })
        );
    }
    return users;
}
