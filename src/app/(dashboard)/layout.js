'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n/provider';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { isRTL } = useI18n();

    return (
        <div className="flex min-h-screen bg-mesh">
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <motion.main
                initial={false}
                animate={{
                    [isRTL ? 'marginRight' : 'marginLeft']: sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 min-h-screen flex flex-col relative z-10"
            >
                <Navbar />
                <div className="flex-1 p-8 md:p-12 overflow-x-hidden">
                    <div className="max-w-[1440px] mx-auto animate-in">
                        {children}
                    </div>
                </div>
            </motion.main>
        </div>
    );
}
