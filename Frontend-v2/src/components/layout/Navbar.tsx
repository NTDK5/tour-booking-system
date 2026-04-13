import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard, Globe, Shield } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';

const NAV_LINKS = [
    { label: 'Tours', path: '/tours' },
    { label: 'Lodges', path: '/lodges' },
    { label: 'Cars', path: '/cars' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => setIsOpen(false), [location]);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-surface/90 backdrop-blur-xl border-b border-surface-border py-4' : 'bg-transparent py-6'
            }`}>
            <div className="section-container flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 bg-primary rounded-lg group-hover:rotate-12 transition-transform duration-300">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-display font-bold text-white tracking-tight">
                        DORZE<span className="text-primary font-extrabold">TOURS</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-8">
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-neutral-300'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3 pl-6 border-l border-surface-border">
                            {isAdmin && (
                                <Link to="/admin">
                                    <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
                                        <Shield className="w-4 h-4" />
                                        Admin Panel
                                    </Button>
                                </Link>
                            )}
                            <div className="relative group">
                                <button className="flex items-center gap-2 p-1 pr-3 rounded-full bg-surface-light border border-surface-border hover:border-primary/50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                        {user.first_name?.[0]}
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-primary transition-colors" />
                                </button>

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-surface-light border border-surface-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                    <div className="p-2 space-y-1">
                                        <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-dark transition-colors text-sm">
                                            <LayoutDashboard className="w-4 h-4 text-primary" />
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-error/10 text-error transition-colors text-sm"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to="/auth/login">
                            <Button className="rounded-full px-8">Sign In</Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden p-2 text-white hover:text-primary transition-colors"
                >
                    {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-surface-light border-b border-surface-border overflow-hidden"
                    >
                        <div className="section-container py-8 flex flex-col gap-6">
                            {NAV_LINKS.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="text-lg font-bold uppercase tracking-widest text-white hover:text-primary transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-6 border-t border-surface-border space-y-4">
                                {user ? (
                                    <>
                                        {isAdmin && (
                                            <Link to="/admin" className="flex items-center gap-2 text-primary font-bold">
                                                <Shield className="w-5 h-5" />
                                                Admin Control Panel
                                            </Link>
                                        )}
                                        <Link to="/dashboard" className="flex items-center gap-2 text-white">
                                            <LayoutDashboard className="w-5 h-5" />
                                            User Dashboard
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-2 text-error"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/auth/login">
                                        <Button className="w-full rounded-2xl">Sign In to Account</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
