import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { sanitizeRedirectTarget, setAuthRedirectPayload } from '@/utils/authRedirect';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const { user, isLoading, isAdmin } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        const requestedPath = `${location.pathname}${location.search || ''}`;
        const returnTo = sanitizeRedirectTarget(requestedPath);

        if (returnTo) {
            setAuthRedirectPayload(returnTo);
            return <Navigate to={`/auth/login?redirect=${encodeURIComponent(returnTo)}`} state={{ from: location }} replace />;
        }

        return <Navigate to="/auth/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
