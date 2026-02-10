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
    } : null;

    const isAuthenticated = !!Cookies.get('sid') && Cookies.get('sid') !== 'Guest';

    const login = useCallback(async (usr, pwd) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.login(usr, pwd);
            if (data.message === 'Logged In') {
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
        router.push('/login');
    }, [router]);

    return { user, isAuthenticated, login, logout, isLoading, error, setError };
}
