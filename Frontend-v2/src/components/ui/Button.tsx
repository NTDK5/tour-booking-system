import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none active:scale-95',
    {
        variants: {
            variant: {
                primary: 'bg-primary text-white hover:bg-primary-600 shadow-glow hover:shadow-primary-600/40',
                secondary: 'bg-surface-light text-white border border-surface-border hover:border-primary/50 hover:bg-surface-card',
                ghost: 'bg-transparent text-neutral-300 hover:text-white hover:bg-white/5',
                danger: 'bg-error/10 text-error border border-error/20 hover:bg-error hover:text-white',
                accent: 'bg-accent text-surface font-bold hover:bg-accent-light shadow-glow-accent',
                outline: 'bg-transparent text-white border border-surface-border hover:border-primary hover:text-primary',
            },
            size: {
                default: 'h-11 px-6',
                sm: 'h-9 px-4 text-xs',
                lg: 'h-14 px-8 text-base',
                icon: 'h-11 w-11',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isLoading, children, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && children}
            </button>
        );
    },
);

Button.displayName = 'Button';
