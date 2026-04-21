import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    BookOpen,
    Box,
    DollarSign,
    Users,
    UserCheck,
    Settings,
    LogOut,
    Car,
    Hotel,
    Globe,
    Menu,
    X,
    History as HistoryIcon,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';

const navGroups = [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
            { label: 'Calendar', icon: Calendar, path: '/admin/calendar' },
        ]
    },
    {
        label: 'Booking Management',
        items: [
            { label: 'Bookings', icon: BookOpen, path: '/admin/bookings' },
        ]
    },
    {
        label: 'Configuration',
        items: [
            { label: 'Tours', icon: Globe, path: '/admin/tours' },
            { label: 'Lodges', icon: Hotel, path: '/admin/lodges' },
            { label: 'Cars', icon: Car, path: '/admin/cars' },
            { label: 'Destinations', icon: Settings, path: '/admin/destinations' },
        ]
    },
    {
        label: 'Operations',
        items: [
            { label: 'Custom Trips', icon: Sparkles, path: '/admin/custom-trips' },
            { label: 'Staff', icon: UserCheck, path: '/admin/staff' },
            { label: 'Inventory', icon: Box, path: '/admin/inventory' },
            { label: 'Financials', icon: DollarSign, path: '/admin/financials' },
            { label: 'Users', icon: Users, path: '/admin/users' },
            { label: 'Audit Logs', icon: HistoryIcon, path: '/admin/logs' },
        ]
    }
];

export function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-surface">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-surface-light border-b border-surface-border flex items-center justify-between px-4 z-50 md:hidden">
                <Link to="/admin" className="text-xl font-bold text-primary">Dorze Admin</Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
            </header>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-64 bg-surface-light border-r border-surface-border transform transition-transform duration-200 ease-in-out z-40
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
                            Dorze<span className="text-foreground">Tours</span>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">OPERATIONS CONTROL</p>
                    </div>

                    <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
                        {navGroups.map((group) => (
                            <div key={group.label} className="space-y-1">
                                <div className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{group.label}</div>
                                {group.items.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`
                                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                            ${location.pathname === item.path
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-surface-dark hover:text-foreground'}
                                        `}
                                        onClick={() => setIsSidebarOpen(false)}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-surface-border">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
                <header className="h-16 border-b border-surface-border hidden md:flex items-center justify-between px-8 bg-surface-light/50 backdrop-blur-sm sticky top-0 z-30">
                    <h1 className="text-lg font-semibold capitalize">
                        {navGroups.flatMap((group) => group.items).find(item => item.path === location.pathname)?.label || 'Admin Panel'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-muted-foreground">Admin-Level Access</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                    </div>
                </header>

                <div className="flex-grow p-4 md:p-8">
                    <Outlet />
                </div>
            </main>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
