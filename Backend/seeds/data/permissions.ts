/**
 * Canonical permission keys for enterprise admin RBAC-ready seeding.
 * Stored on User.permissions when role === 'admin'.
 */
export const ADMIN_PACKAGE_PERMISSIONS = [
    'packages:read',
    'packages:create',
    'packages:update',
    'packages:publish',
    'packages:archive',
    'packages:media',
    'packages:pricing',
    'packages:availability',
    'packages:departures',
    'bookings:read',
    'bookings:create',
    'bookings:update',
    'bookings:cancel',
    'bookings:refund',
    'payments:read',
    'payments:capture',
    'reports:dashboard',
    'reports:export',
    'users:read',
    'users:invite',
    'resources:guides',
    'resources:vehicles',
    'resources:properties',
    'settings:read',
    'settings:update',
] as const;

export type AdminPermissionKey = (typeof ADMIN_PACKAGE_PERMISSIONS)[number];
