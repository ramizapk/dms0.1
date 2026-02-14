'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/ui/NotificationItem';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export default function NotificationDropdown() {
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications
    } = useNotifications();
    const { t, isRTL } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="notification-dropdown-container" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="navbar__notification-btn relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                    <span className="navbar__notification-dot" />
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="notification-dropdown"
                        style={{
                            [isRTL ? 'left' : 'right']: 0,
                            transformOrigin: isRTL ? 'top left' : 'top right'
                        }}
                    >
                        <div className="notification-dropdown__header">
                            <h3 className="notification-dropdown__title">
                                {t('notifications.title') || (isRTL ? 'الإشعارات' : 'Notifications')}
                            </h3>
                            <div className="notification-dropdown__actions">
                                <button
                                    onClick={fetchNotifications}
                                    className="notification-dropdown__action-btn"
                                    title={isRTL ? 'تحديث' : 'Refresh'}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="notification-dropdown__action-btn"
                                        title={t('notifications.mark_all_as_read') || (isRTL ? 'تحديد الكل كمقروء' : 'Mark all as read')}
                                    >
                                        <CheckCheck className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="notification-dropdown__list">
                            {notifications.length === 0 ? (
                                <div className="notification-dropdown__empty">
                                    <Bell className="h-8 w-8 text-gray-300 mb-2" />
                                    <p>{t('notifications.empty') || (isRTL ? 'لا توجد إشعارات' : 'No notifications')}</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <NotificationItem
                                        key={notification.name}
                                        notification={notification}
                                        onRead={markAsRead}
                                        onDelete={deleteNotification}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

import { useState } from 'react';
