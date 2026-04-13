import { Button } from '@/components/ui/Button';
import { Mail, ArrowRight } from 'lucide-react';

export function CTASection() {
    return (
        <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="relative overflow-hidden rounded-[3rem] bg-gold-gradient p-12 md:p-20 text-center">
                    {/* Abstract circles for flair */}
                    <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-surface/10 rounded-full blur-2xl" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-display-md md:text-display-lg font-extrabold text-surface mb-6 leading-tight">
                            Ready to Start Your <br className="hidden md:block" />
                            Next Great Adventure?
                        </h2>
                        <p className="text-xl text-surface/80 mb-10 font-medium italic">
                            "Traveling allows you to see the world from a different perspective."
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button size="lg" className="bg-surface text-white hover:bg-surface-light w-full sm:w-auto h-14 px-10">
                                Book a Custom Trip
                            </Button>
                            <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                                <div className="h-0.5 w-8 bg-surface/20" />
                                <span className="text-surface/60 font-bold uppercase tracking-widest text-xs">Or</span>
                                <div className="h-0.5 w-8 bg-surface/20" />
                            </div>
                            <Button size="lg" variant="ghost" className="text-surface font-bold hover:bg-surface/5 w-full sm:w-auto h-14">
                                Consult an Expert
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Newsletter Sub-section */}
                <div className="mt-16 glass-dark p-8 md:p-12 rounded-[2.5rem] border-primary/10 flex flex-col lg:flex-row items-center gap-8 justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Subscribe to our Journey</h3>
                        <p className="text-neutral-400">Get weekly updates on new tours, lodges, and travel tips.</p>
                    </div>
                    <div className="flex w-full lg:w-auto max-w-md gap-2">
                        <div className="flex-grow relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full h-14 pl-12 pr-4 bg-surface border border-surface-border rounded-2xl outline-none focus:border-primary transition-colors text-white"
                            />
                        </div>
                        <Button className="h-14 px-8">Subscribe</Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
