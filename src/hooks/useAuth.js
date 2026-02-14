'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';

export function useAuth() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const user = typeof window !== 'undefined' ? {
        fullName: Cookies.get('full_name') || null,
        userId: Cookies.get('user_id') || null,
        isSystemUser: Cookies.get('system_user') === 'yes',
        userImage: Cookies.get('user_image') || null,
        workspaces: Cookies.get('workspaces') ? JSON.parse(Cookies.get('workspaces')) : [],
        permissions: Cookies.get('permissions') ? JSON.parse(Cookies.get('permissions')) : {},
    } : null;

    const isAuthenticated = !!Cookies.get('sid') && Cookies.get('sid') !== 'Guest';

    const login = useCallback(async (usr, pwd) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.login(usr, pwd);
            if (data.message === 'Logged In') {
                if (data.workspaces) {
                    Cookies.set('workspaces', JSON.stringify(data.workspaces), { expires: 1 }); // Expires in 1 day
                }
                if (data.permissions) {
                    Cookies.set('permissions', JSON.stringify(data.permissions), { expires: 1 });
                }
                router.push('/dashboard');
                return true;
            }
            setError('Login failed');
            return false;
        } catch (err) {
            setError(err.message || 'Login failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const logout = useCallback(async () => {
        try {
            await api.logout();
        } catch {
            // Continue logout even if API fails
        }
        Cookies.remove('sid');
        Cookies.remove('full_name');
        Cookies.remove('user_id');
        Cookies.remove('system_user');
        Cookies.remove('user_image');
        Cookies.remove('workspaces');
        Cookies.remove('permissions');
        router.push('/login');
    }, [router]);

    return { user, isAuthenticated, login, logout, isLoading, error, setError };
}
