import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary/20 text-primary-300',
                secondary: 'border-transparent bg-neutral-800 text-neutral-400',
                success: 'border-transparent bg-success/20 text-success',
                destructive: 'border-transparent bg-error/20 text-error',
                outline: 'text-neutral-400 border-neutral-700',
                accent: 'border-transparent bg-accent/20 text-accent-light',
                warning: 'border-transparent bg-amber-500/20 text-amber-500',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

export function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}
