import { Badge } from '@/components/ui/Badge';
import type { ItineraryDay } from '@/types';

interface PackageItineraryProps {
    itinerary: ItineraryDay[];
}

export function PackageItinerary({ itinerary }: PackageItineraryProps) {
    if (!itinerary?.length) return null;

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-10">
                Your <span className="text-gradient">Itinerary</span>
            </h2>
            <div className="space-y-4">
                {itinerary.map((day, idx) => (
                    <div key={idx} className="relative pl-12 pb-12 last:pb-0">
                        {idx !== itinerary.length - 1 && (
                            <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-surface-border" />
                        )}

                        <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-surface-light border-2 border-primary flex items-center justify-center text-primary font-bold z-10">
                            {typeof day.day === 'number' ? day.day : idx + 1}
                        </div>

                        <div className="bg-surface-light rounded-3xl p-6 border border-surface-border shadow-soft">
                            <h4 className="text-2xl font-bold text-white mb-3">{day.title || `Day ${idx + 1}`}</h4>
                            <p className="text-neutral-300 text-lg leading-relaxed">{day.description}</p>

                            {day.activities && day.activities.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {day.activities.map((act, i) => {
                                        const isObject = typeof act === 'object' && act !== null;
                                        const label = isObject ? (act as any).activity : act;
                                        const time = isObject ? (act as any).time : '';

                                        return (
                                            <Badge key={i} variant="secondary" className="bg-surface text-sm gap-1.5 py-2 px-3.5">
                                                {time && (
                                                    <span className="text-primary/70 font-mono uppercase tracking-tighter">{time}</span>
                                                )}
                                                <span>{label}</span>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
