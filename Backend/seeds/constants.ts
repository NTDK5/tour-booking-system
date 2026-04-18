import { DEFAULT_ADMIN_EMAIL } from './seeders/adminSeeder';
import { CUSTOMER_SEEDS } from './seeders/customerSeeder';

export const SEED_USER_EMAILS = [DEFAULT_ADMIN_EMAIL, ...CUSTOMER_SEEDS.map((c) => c.email)];
