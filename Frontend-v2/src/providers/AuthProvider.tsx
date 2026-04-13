import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AuthUser } from '@/types';
import { authApi } from '@/api/auth';

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (first_name: string, last_name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: AuthUser | null) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): AuthUser | null {
    try {
        const raw = localStorage.getItem('auth_user');
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<AuthUser | null>(getStoredUser);
    const [isLoading, setIsLoading] = useState(false);

    const setUser = useCallback((u: AuthUser | null) => {
        setUserState(u);
        if (u) localStorage.setItem('auth_user', JSON.stringify(u));
        else localStorage.removeItem('auth_user');
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const authUser = await authApi.login({ email, password });
            setUser(authUser);
        } finally {
            setIsLoading(false);
        }
    }, [setUser]);

    const register = useCallback(async (
        first_name: string, last_name: string, email: string, password: string
    ) => {
        setIsLoading(true);
        try {
            const authUser = await authApi.register({ first_name, last_name, email, password });
            setUser(authUser);
        } finally {
            setIsLoading(false);
        }
    }, [setUser]);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            try { await authApi.logout(); } catch { /* ignore */ }
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [setUser]);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin',
            login,
            register,
            logout,
            setUser,
            isLoading,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
