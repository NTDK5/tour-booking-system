export type OperationalActionContext = {
    action: string;
    departureId?: string;
    staffRole?: 'guide' | 'driver';
    [key: string]: unknown;
};

const KEY = 'auth_redirect_payload';
const AUTH_PATH_PREFIX = '/auth';

export function setAuthRedirectPayload(returnTo: string, context?: OperationalActionContext) {
    try {
        sessionStorage.setItem(KEY, JSON.stringify({ returnTo, context }));
    } catch {
        // noop
    }
}

export function getAuthRedirectPayload(): { returnTo?: string; context?: OperationalActionContext } | null {
    try {
        const raw = sessionStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function consumeAuthRedirectPayload(): { returnTo?: string; context?: OperationalActionContext } | null {
    const payload = getAuthRedirectPayload();
    try {
        sessionStorage.removeItem(KEY);
    } catch {
        // noop
    }
    return payload;
}

export function sanitizeRedirectTarget(target?: string | null): string | null {
    if (!target) return null;

    const trimmed = target.trim();
    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;

    try {
        const url = new URL(trimmed, window.location.origin);
        if (url.origin !== window.location.origin) return null;
        if (url.pathname.startsWith(AUTH_PATH_PREFIX)) return null;
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return null;
    }
}
