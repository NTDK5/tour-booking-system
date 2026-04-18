import User from '../../models/userModel';
import { ADMIN_PACKAGE_PERMISSIONS } from '../data/permissions';

export const DEFAULT_ADMIN_EMAIL = 'admin@system.com';

export async function seedAdminUsers(adminPasswordPlain: string) {
    await User.deleteMany({ email: DEFAULT_ADMIN_EMAIL });

    const admin = await User.create({
        fullName: 'System Administrator',
        first_name: 'System',
        last_name: 'Administrator',
        email: DEFAULT_ADMIN_EMAIL,
        password: adminPasswordPlain,
        role: 'admin',
        verified: true,
        country: 'Ethiopia',
        permissions: [...ADMIN_PACKAGE_PERMISSIONS],
        status: 'active',
    });

    return admin;
}
