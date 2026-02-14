'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.getNotifications();
            if (response.message && response.message.data && response.message.data.notifications) {
                const fetchedNotifications = response.message.data.notifications;
                setNotifications(fetchedNotifications);

                // Calculate unread count locally for now since API doesn't return it in meta
                const count = fetchedNotifications.filter(n => n.read === 0).length;
                setUnreadCount(count);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            setError(err.message || 'Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.name === notificationId ? { ...n, read: 1 } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await api.markAsRead(notificationId);
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            // Revert on failure (could implement more robust rollback)
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
            setUnreadCount(0);

            await api.markAllAsRead();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            // Optimistic update
            const notificationToDelete = notifications.find(n => n.name === notificationId);
            setNotifications(prev => prev.filter(n => n.name !== notificationId));

            if (notificationToDelete && notificationToDelete.read === 0) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            await api.deleteNotification(notificationId);
        } catch (err) {
            console.error('Failed to delete notification:', err);
            fetchNotifications();
        }
    }, [notifications, fetchNotifications]);

    useEffect(() => {
        fetchNotifications();
        // Optional: Polling interval could be added here
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };
}
