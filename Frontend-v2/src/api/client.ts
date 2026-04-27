import axios, { type AxiosError } from 'axios';
import type { ApiError } from '@/types';
import { sanitizeRedirectTarget, setAuthRedirectPayload } from '@/utils/authRedirect';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use((config) => {
    const raw = localStorage.getItem('auth_user');
    if (raw) {
        try {
            const user = JSON.parse(raw) as { token?: string };
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch {
            // ignore parse errors
        }
    }
    return config;
});

// Response interceptor — normalise errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_user');
            const currentPath = window.location.pathname;
            const requestUrl = String(error.config?.url || '').toLowerCase();
            const isOnAuthRoute = currentPath.startsWith('/auth');
            const isAuthRequest =
                requestUrl.includes('/users/auth') ||
                requestUrl.includes('/users/register');

            if (!isOnAuthRoute && !isAuthRequest) {
                const rawReturnTo = `${window.location.pathname}${window.location.search || ''}`;
                const returnTo = sanitizeRedirectTarget(rawReturnTo);

                if (returnTo) {
                    setAuthRedirectPayload(returnTo);
                    window.location.href = `/auth/login?redirect=${encodeURIComponent(returnTo)}`;
                } else {
                    window.location.href = '/auth/login';
                }
            }
        }
        return Promise.reject(error);
    },
);
