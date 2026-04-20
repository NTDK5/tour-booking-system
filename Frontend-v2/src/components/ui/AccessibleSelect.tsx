import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type AccessibleSelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

interface AccessibleSelectProps {
    value?: string;
    options: AccessibleSelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function AccessibleSelect({
    value,
    options,
    onChange,
    placeholder = 'Select an option',
    disabled,
    className,
}: AccessibleSelectProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

    useEffect(() => {
        const onDocClick = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((s) => !s)}
                className={cn(
                    'w-full h-11 px-4 rounded-xl bg-surface-dark border border-surface-border text-white text-left flex items-center justify-between',
                    'focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed',
                    className
                )}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={selected ? 'text-white' : 'text-neutral-500'}>{selected?.label || placeholder}</span>
                <ChevronDown size={16} className={cn('text-neutral-400 transition-transform', open && 'rotate-180')} />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-surface-border bg-surface-light shadow-lg overflow-hidden">
                    <ul role="listbox" className="max-h-60 overflow-auto py-1">
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <li key={option.value}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        disabled={option.disabled}
                                        onClick={() => {
                                            if (option.disabled) return;
                                            onChange(option.value);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            'w-full px-3 py-2.5 text-left text-sm flex items-center justify-between',
                                            option.disabled
                                                ? 'text-neutral-600 cursor-not-allowed'
                                                : 'text-white hover:bg-surface-dark/60',
                                            isSelected && 'bg-primary/15 text-primary'
                                        )}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && <Check size={14} />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
