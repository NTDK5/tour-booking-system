import { LucideIcon, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon: Icon = SearchX,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-up">
            <div className="w-20 h-20 bg-surface-light rounded-full flex items-center justify-center mb-6 border border-surface-border">
                <Icon className="w-10 h-10 text-neutral-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-neutral-400 max-w-sm mb-8">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
