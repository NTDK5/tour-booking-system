import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, type, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="text-sm font-medium text-neutral-400 px-1">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-12 w-full rounded-xl border bg-surface-light px-4 py-2 text-sm text-white ring-offset-surface transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
                        error ? 'border-error ring-error/20' : 'border-surface-border hover:border-neutral-700',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="text-xs text-error mt-1 px-1">{error}</p>}
            </div>
        );
    },
);

Input.displayName = 'Input';
