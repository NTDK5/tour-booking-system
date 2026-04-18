/** Activities follow backend sub-schema: time, activity, optional description */

export function activity(time: string, activity: string, description?: string) {
    const a: Record<string, string> = { time, activity };
    if (description) a.description = description;
    return a;
}

export function itineraryDay(params: {
    day: number;
    title: string;
    description: string;
    activities: ReturnType<typeof activity>[];
    mealsIncluded: string[];
    overnight: string;
    accommodationLevel: string;
}) {
    return params;
}
