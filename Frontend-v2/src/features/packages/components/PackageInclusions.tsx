import { CheckCircle2, XCircle } from 'lucide-react';

interface PackageInclusionsProps {
    includedItems: string[];
    excludedItems: string[];
}

export function PackageInclusions({ includedItems, excludedItems }: PackageInclusionsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 border-y border-surface-border">
            <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    What&apos;s Included
                </h3>
                <ul className="space-y-4">
                    {includedItems.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-neutral-400 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-error" />
                    Not Included
                </h3>
                <ul className="space-y-4">
                    {excludedItems.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-neutral-400 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
