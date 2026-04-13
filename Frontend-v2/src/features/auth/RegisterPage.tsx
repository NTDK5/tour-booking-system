import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const registerSchema = z.object({
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().min(2, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [passwordValue, setPasswordValue] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            await registerUser(data.first_name, data.last_name, data.email, data.password);
            toast.success('Account created! Welcome to Dorze Tours.');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (!passwordValue) return 0;
        let strength = 0;
        if (passwordValue.length >= 8) strength++;
        if (/[A-Z]/.test(passwordValue)) strength++;
        if (/[0-9]/.test(passwordValue)) strength++;
        if (/[^A-Za-z0-9]/.test(passwordValue)) strength++;
        return strength;
    };

    const strength = getPasswordStrength();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-light border border-surface-border p-8 rounded-2xl shadow-xl w-full max-w-xl mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-neutral-400 text-sm">Join the community and start your journey.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        placeholder="John"
                        error={errors.first_name?.message}
                        {...register('first_name')}
                    />
                    <Input
                        label="Last Name"
                        placeholder="Doe"
                        error={errors.last_name?.message}
                        {...register('last_name')}
                    />
                </div>

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                />

                <div className="space-y-2">
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register('password', {
                            onChange: (e) => setPasswordValue(e.target.value)
                        })}
                    />

                    {/* Password Strength Indicator */}
                    <div className="flex gap-1 h-1 px-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={`flex-grow rounded-full transition-colors duration-300 ${i <= strength
                                        ? strength <= 2 ? 'bg-warning' : 'bg-success'
                                        : 'bg-surface-border'
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-[10px] text-neutral-500">Min 8 chars, mix of numbers and symbols.</p>
                </div>

                <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    error={errors.confirm_password?.message}
                    {...register('confirm_password')}
                />

                <div className="flex items-center gap-2 py-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span className="text-[10px] text-neutral-400">Your data is secured with enterprise-grade encryption.</span>
                </div>

                <Button
                    type="submit"
                    variant="secondary"
                    className="w-full gap-2 mt-2 h-12"
                    isLoading={isLoading}
                >
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-surface-border text-center">
                <p className="text-neutral-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="text-primary font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}
