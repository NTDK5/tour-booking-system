import { apiClient } from '@/api/client';
import type { AuthUser, User } from '@/types';

interface LoginPayload { email: string; password: string; }
interface RegisterPayload { first_name: string; last_name: string; email: string; password: string; }
interface UpdateProfilePayload { first_name?: string; last_name?: string; phone?: string; nationality?: string; }

export const authApi = {
    login: async (payload: LoginPayload): Promise<AuthUser> => {
        const { data } = await apiClient.post('/users/auth', payload);
        return data;
    },

    register: async (payload: RegisterPayload): Promise<AuthUser> => {
        const { data } = await apiClient.post('/users', payload);
        return data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/users/logout');
    },

    getProfile: async (id: string): Promise<User> => {
        const { data } = await apiClient.get(`/users/admin/${id}`);
        return data;
    },

    updateProfile: async (id: string, payload: UpdateProfilePayload): Promise<User> => {
        const { data } = await apiClient.put(`/users/admin/${id}`, payload);
        return data;
    },
};
