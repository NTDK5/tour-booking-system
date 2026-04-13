import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';

export function DashboardLayout() {
    return (
        <div className="min-h-screen bg-surface">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Outlet />
            </main>
        </div>
    );
}
