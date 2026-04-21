import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { consumeAuthRedirectPayload } from '@/utils/authRedirect';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Where to redirect after login — honour the "from" state set by ProtectedRoute
    const searchParams = new URLSearchParams(location.search);
    const queryRedirect = searchParams.get('redirect');
    const from = (location.state as any)?.from?.pathname || queryRedirect || null;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const authUser = await authApi.login(data);
            setUser(authUser);
            toast.success('Welcome back to Dorze Tours!');

            // Redirect: to the original protected page, or admin, or home
            const pendingPayload = consumeAuthRedirectPayload();
            if (from || pendingPayload?.returnTo) {
                navigate((from || pendingPayload?.returnTo) as string, {
                    replace: true,
                    state: pendingPayload?.context ? { postLoginAction: pendingPayload.context } : undefined,
                });
            } else if (authUser.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-surface-light border border-surface-border p-8 rounded-2xl shadow-xl w-full"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-neutral-400 text-sm">
                    {from ? `Sign in to continue to ${from}` : 'Review your custom trips and book new adventures.'}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                />

                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register('password')}
                    />
                    <div className="text-right">
                        <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full gap-2 mt-4"
                    size="lg"
                    isLoading={isLoading}
                >
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-surface-border text-center">
                <p className="text-neutral-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/auth/register" className="text-primary font-bold hover:underline">
                        Register Now
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}
