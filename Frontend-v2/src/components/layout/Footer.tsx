import { Link } from 'react-router-dom';
import { Globe, Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const footerLinks = {
    explore: [
        { label: 'Tours', path: '/tours' },
        { label: 'Lodges', path: '/lodges' },
        { label: 'Cars', path: '/cars' },
        { label: 'Gallery', path: '/gallery' },
    ],
    company: [
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
    ],
};

export function Footer() {
    return (
        <footer className="bg-surface-light border-t border-surface-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link to="/" className="flex items-center gap-2 group w-fit">
                            <div className="p-1.5 bg-primary rounded-lg group-hover:rotate-12 transition-transform duration-300">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-display font-bold text-white tracking-tight">
                                DORZE<span className="text-primary font-extrabold">TOURS</span>
                            </span>
                        </Link>
                        <p className="text-neutral-400 max-w-sm leading-relaxed text-sm">
                            Discover the beauty of Ethiopia with our premium, curated travel experiences. 
                            From ancient rock-hewn churches to breathtaking mountain landscapes.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-neutral-400 text-sm">
                                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>Addis Ababa, Ethiopia</span>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-400 text-sm">
                                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>+251 911 000 000</span>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-400 text-sm">
                                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>info@dorztours.com</span>
                            </div>
                        </div>
                        {/* Social Icons */}
                        <div className="flex items-center gap-4 pt-2">
                            {[Instagram, Facebook, Twitter].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center text-neutral-400 hover:text-primary hover:border-primary/50 transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Explore</h4>
                        <ul className="space-y-3">
                            {footerLinks.explore.map(link => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-neutral-400 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map(link => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-neutral-400 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-surface-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-neutral-500 text-sm">
                        © {new Date().getFullYear()} Dorze Tours. All rights reserved.
                    </p>
                    <p className="text-neutral-600 text-xs">
                        Crafted with ❤️ in Ethiopia
                    </p>
                </div>
            </div>
        </footer>
    );
}
