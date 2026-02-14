'use client';

import { formatDistanceToNow } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { useI18n } from '@/i18n/provider';
import { FileText, alertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function NotificationItem({ notification, onRead, onDelete }) {
    const { locale } = useI18n();
    const isRTL = locale === 'ar';
    const dateLocale = isRTL ? arSA : enUS;

    const handleClick = () => {
        if (!notification.read) {
            onRead(notification.name);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(notification.name);
        }
    };

    return (
        <div
            className={`notification-item ${notification.read ? 'notification-item--read' : 'notification-item--unread'}`}
            onClick={handleClick}
        >
            <div className="notification-item__icon">
                {/* Dynamically choose icon based on type if available, fallback to FileText */}
                <FileText className="h-5 w-5 text-blue-500" />
            </div>

            <div className="notification-item__content">
                <div className="notification-item__header">
                    <span className="notification-item__user">{notification.from_user_full_name}</span>
                    <div className="flex items-center gap-2">
                        <span className="notification-item__time">
                            {formatDistanceToNow(new Date(notification.creation), { addSuffix: true, locale: dateLocale })}
                        </span>
                        <button
                            onClick={handleDelete}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                            title={isRTL ? "حذف" : "Delete"}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <h4 className="notification-item__subject">{notification.subject}</h4>

                {notification.document_name && (
                    <p className="notification-item__doc-ref">
                        {notification.document_name}
                    </p>
                )}

                {notification.document_link && (
                    <Link
                        href={notification.document_link}
                        className="notification-item__link"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                    >
                        {isRTL ? 'عرض المستند' : 'View Document'}
                    </Link>
                )}
            </div>

            {!notification.read && (
                <div className="notification-item__status-dot" />
            )}
        </div>
    );
}
