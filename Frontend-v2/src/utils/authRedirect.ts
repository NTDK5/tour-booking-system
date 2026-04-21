export type OperationalActionContext = {
    action: string;
    departureId?: string;
    staffRole?: 'guide' | 'driver';
    [key: string]: unknown;
};

const KEY = 'auth_redirect_payload';

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
