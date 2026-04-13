export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`skeleton ${className}`} />
    );
}

export function TourCardSkeleton() {
    return (
        <div className="card h-full">
            <Skeleton className="aspect-tour-card" />
            <div className="p-5 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="pt-4 border-t border-surface-border flex justify-between items-end">
                    <div className="space-y-1">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    );
}

export function LodgeCardSkeleton() {
    return (
        <div className="card h-full">
            <Skeleton className="aspect-video" />
            <div className="p-5 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-7 w-2/3" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="pt-4 border-t border-surface-border flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>
        </div>
    );
}
