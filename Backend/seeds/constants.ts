import { DEFAULT_ADMIN_EMAIL } from './seeders/adminSeeder';
import { CUSTOMER_SEEDS } from './seeders/customerSeeder';
import { STAFF_SEEDS } from './seeders/staffSeeder';

export const SEED_USER_EMAILS = [DEFAULT_ADMIN_EMAIL, ...CUSTOMER_SEEDS.map((c) => c.email)];
export const SEED_STAFF_EMAILS = STAFF_SEEDS.map((s) => s.email);
