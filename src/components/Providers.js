'use client';

import { I18nProvider } from '@/i18n/provider';
import { ToastProvider } from '@/context/ToastContext';

export default function Providers({ children }) {
    return (
        <I18nProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </I18nProvider>
    );
}
