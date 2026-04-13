import React from 'react';
import { motion } from 'framer-motion';
import {
    Mail, Phone, MapPin,
    Send, MessageSquare, Clock,
    Facebook, Instagram, Twitter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const contactInfo = [
    {
        icon: Phone,
        label: 'Call Us',
        value: '+251 911 558 344',
        sub: 'Available daily 8:00 - 20:00',
    },
    {
        icon: Mail,
        label: 'Email Us',
        value: 'info@dorzetours.com',
        sub: 'Quick response guaranteed',
    },
    {
        icon: MapPin,
        label: 'Visit Us',
        value: 'Addis Ababa, Ethiopia',
        sub: 'Bole Road, Getu Commercial Center',
    }
];

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-surface py-20 md:py-32">
            <div className="section-container">
                {/* Header */}
                <header className="text-center mb-24 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-[0.3em] mb-6"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Connect With Us
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-8 italic"
                    >
                        Get in <span className="text-primary italic-none tracking-widest">Touch</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-neutral-400 text-lg md:text-xl font-light leading-relaxed"
                    >
                        Planning your next great adventure or have a question about our services? Our team of Ethiopian travel experts is here to help you 24/7.
                    </motion.p>
                </header>

                <div className="grid lg:grid-cols-5 gap-16 items-start">
                    {/* Info Side */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="space-y-8">
                            {contactInfo.map((info, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-8 group"
                                >
                                    <div className="w-16 h-16 rounded-[24px] bg-surface-light border border-surface-border flex items-center justify-center shrink-0 group-hover:border-primary transition-colors">
                                        <info.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">{info.label}</div>
                                        <div className="text-xl font-bold text-white mb-1">{info.value}</div>
                                        <div className="text-sm text-neutral-600 font-medium">{info.sub}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Socials */}
                        <div className="p-10 rounded-[40px] bg-surface-light border border-surface-border">
                            <h3 className="text-lg font-bold text-white mb-6 italic">Follow the <span className="text-primary tracking-widest uppercase text-sm">Vibe</span></h3>
                            <div className="flex gap-4">
                                <a href="#" className="w-12 h-12 rounded-full bg-surface border border-surface-border flex items-center justify-center text-neutral-400 hover:text-primary hover:border-primary transition-all">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-12 h-12 rounded-full bg-surface border border-surface-border flex items-center justify-center text-neutral-400 hover:text-primary hover:border-primary transition-all">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-12 h-12 rounded-full bg-surface border border-surface-border flex items-center justify-center text-neutral-400 hover:text-primary hover:border-primary transition-all">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-12 md:p-16 rounded-[48px] bg-surface-light border border-surface-border shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                            <form className="space-y-8 relative z-10">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <Input label="Full Name" placeholder="John Doe" />
                                    <Input label="Email Address" type="email" placeholder="john@example.com" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <Input label="Phone (Optional)" placeholder="+251 ..." />
                                    <Input label="Subject" placeholder="General Inquiry" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2">Your Message</label>
                                    <textarea
                                        className="w-full h-48 bg-surface border border-surface-border rounded-[32px] p-6 text-white outline-none focus:border-primary transition-all resize-none"
                                        placeholder="How can we help you plan your journey?"
                                    />
                                </div>
                                <Button variant="accent" className="w-full h-20 rounded-[32px] text-xl font-bold group">
                                    Send Message
                                    <Send className="ml-2 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>

                {/* Map Placeholder */}
                <section className="mt-32 h-[500px] w-full rounded-[48px] overflow-hidden border border-surface-border relative group">
                    <div className="absolute inset-0 bg-surface-light flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white italic">Our <span className="text-primary tracking-widest">Headquarters</span></h3>
                            <p className="text-neutral-500 max-w-sm mx-auto">Find us at the heart of Addis Ababa, where your adventure begins.</p>
                            <Button variant="secondary" className="bg-transparent border-white/10 text-white mt-4">Open in Google Maps</Button>
                        </div>
                    </div>
                    {/* Mock Map Image */}
                    <div className="absolute inset-0 opacity-40 group-hover:opacity-20 transition-opacity">
                        <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale" />
                    </div>
                </section>
            </div>
        </div>
    );
}
