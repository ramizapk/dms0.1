'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/provider';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { isRTL } = useI18n();

    // Track screen size for responsive behavior
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarCollapsed(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleToggleSidebar = () => {
        if (isMobile) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    const handleMobileClose = () => {
        setIsMobileOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-mesh">
            <Sidebar
                isCollapsed={isMobile ? true : sidebarCollapsed}
                onToggle={handleToggleSidebar}
                isMobileOpen={isMobileOpen}
                onMobileClose={handleMobileClose}
            />
            <motion.main
                initial={false}
                animate={{
                    marginLeft: !isRTL && !isMobile
                        ? sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'
                        : '0px',
                    marginRight: isRTL && !isMobile
                        ? sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'
                        : '0px',
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 min-h-screen flex flex-col relative z-10"
            >
                <Navbar
                    isSidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={handleToggleSidebar}
                    onMobileMenuOpen={() => setIsMobileOpen(true)}
                />
                <div className="dashboard-content">
                    <div className="max-w-[1440px] mx-auto animate-in">
                        {children}
                    </div>
                </div>
            </motion.main>
        </div>
    );
}
