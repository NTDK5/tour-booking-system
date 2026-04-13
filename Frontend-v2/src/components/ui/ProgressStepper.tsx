import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
    steps: string[];
    currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
    return (
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-12">
            {steps.map((step, idx) => {
                const isCompleted = currentStep > idx + 1;
                const isActive = currentStep === idx + 1;

                return (
                    <div key={step} className="flex flex-col items-center relative flex-1">
                        {/* Connector Line */}
                        {idx !== 0 && (
                            <div className={`absolute right-1/2 top-5 w-full h-[2px] -translate-y-1/2 z-0 ${isCompleted || isActive ? 'bg-primary' : 'bg-surface-border'
                                }`} />
                        )}

                        {/* Step Circle */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all duration-300 ${isCompleted
                                ? 'bg-primary text-white'
                                : isActive
                                    ? 'bg-surface border-2 border-primary text-primary shadow-glow'
                                    : 'bg-surface border-2 border-surface-border text-neutral-500'
                            }`}>
                            {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                        </div>

                        {/* Step Label */}
                        <span className={`mt-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${isActive ? 'text-primary' : 'text-neutral-500'
                            }`}>
                            {step}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
