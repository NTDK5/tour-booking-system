import { Outlet } from 'react-router-dom';

/**
 * AuthLayout — wraps auth pages (login, register) in a centered layout.
 * NOTE: Deliberately does NOT wrap in AuthProvider since AuthProvider
 * is already mounted at the root level in main.tsx.
 * Wrapping it again would create a completely isolated context and
 * break login/logout (user state changes in the inline provider
 * would not propagate to the root router).
 */
export function AuthLayout() {
    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Outlet />
            </div>
        </div>
    );
}
