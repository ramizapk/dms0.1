'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import { NAV_ITEMS } from '@/lib/constants';
import {
    LayoutDashboard,
    FileText,
    FolderKanban,
    Settings,
    Archive,
    LogOut,
    FileStack,
    X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const iconMap = {
    LayoutDashboard,
    FileText,
    FolderKanban,
    Settings,
    Archive,
};

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }) {
    const pathname = usePathname();
    const { t, isRTL } = useI18n();
    const { logout, user } = useAuth();
    const [hoveredItem, setHoveredItem] = useState(null);

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="sidebar-overlay"
                        onClick={onMobileClose}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`sidebar-container ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}
                style={{
                    left: isRTL ? 'auto' : 0,
                    right: isRTL ? 0 : 'auto'
                }}
            >
                {/* Brand Header */}
                <div
                    className={`sidebar-brand ${isCollapsed ? 'sidebar-brand--collapsed' : ''}`}
                    style={{ height: 'var(--navbar-height)' }}
                >
                    <div className={`relative transition-all duration-300 ${isCollapsed ? 'h-10 w-10' : 'h-24 -mt-2 w-full'}`}>
                        <Image
                            src="/logo.png"
                            alt="Multi Business Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Mobile close button */}
                    {isMobileOpen && (
                        <button className="sidebar-mobile-close" onClick={onMobileClose}>
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <div className={`sidebar-nav ${isCollapsed ? 'sidebar-nav--collapsed' : ''}`}>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="sidebar-nav__section-title"
                            >
                                <span>{t('sidebar.menu') || 'Navigation'}</span>
                                <span className="sidebar-nav__section-line" />
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <div className="sidebar-nav__items">
                        {NAV_ITEMS.map((item, idx) => {
                            const Icon = iconMap[item.icon] || LayoutDashboard;
                            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

                            return (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * idx }}
                                    className="sidebar-nav__item-wrapper"
                                    onMouseEnter={() => setHoveredItem(item.key)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <Link
                                        href={item.path}
                                        onClick={onMobileClose}
                                        className={`sidebar-nav__link ${isActive ? 'sidebar-nav__link--active' : ''} ${isCollapsed ? 'sidebar-nav__link--collapsed' : ''}`}
                                    >
                                        {/* Active background card */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNavBg"
                                                className="sidebar-nav__active-bg"
                                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                            />
                                        )}

                                        {/* Active side marker */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNavMarker"
                                                className={`sidebar-nav__active-marker ${isRTL ? 'sidebar-nav__active-marker--rtl' : ''}`}
                                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                            />
                                        )}

                                        {/* Icon */}
                                        <div className={`sidebar-nav__icon ${isActive ? 'sidebar-nav__icon--active' : ''}`}>
                                            <Icon
                                                className="sidebar-nav__icon-svg"
                                                strokeWidth={isActive ? 2.5 : 1.8}
                                            />
                                        </div>

                                        {/* Label */}
                                        <AnimatePresence>
                                            {!isCollapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                                                    className={`sidebar-nav__label ${isActive ? 'sidebar-nav__label--active' : ''}`}
                                                >
                                                    {t(`sidebar.${item.key}`)}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </Link>

                                    {/* Tooltip for collapsed state */}
                                    <AnimatePresence>
                                        {isCollapsed && hoveredItem === item.key && (
                                            <motion.div
                                                initial={{ opacity: 0, x: isRTL ? 10 : -10, scale: 0.9 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                exit={{ opacity: 0, x: isRTL ? 10 : -10, scale: 0.9 }}
                                                transition={{ duration: 0.15 }}
                                                className={`sidebar-tooltip ${isRTL ? 'sidebar-tooltip--rtl' : ''}`}
                                            >
                                                {t(`sidebar.${item.key}`)}
                                                <span className={`sidebar-tooltip__arrow ${isRTL ? 'sidebar-tooltip__arrow--rtl' : ''}`} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Profile & Logout Section */}
                <div className={`sidebar-footer ${isCollapsed ? 'sidebar-footer--collapsed' : ''}`}>
                    {/* User Profile Card */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        className={`sidebar-profile ${isCollapsed ? 'sidebar-profile--collapsed' : ''}`}
                    >
                        <div className="sidebar-profile__avatar-wrapper">
                            <div className="sidebar-profile__avatar">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="sidebar-profile__status" />
                        </div>

                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="sidebar-profile__info"
                                >
                                    <p className="sidebar-profile__name">
                                        {user?.fullName || 'User'}
                                    </p>
                                    <p className="sidebar-profile__role">
                                        <span className="sidebar-profile__role-dot" />
                                        {user?.role || 'Administrator'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className={`sidebar-logout ${isCollapsed ? 'sidebar-logout--collapsed' : ''}`}
                    >
                        <LogOut className="sidebar-logout__icon" />
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="sidebar-logout__text"
                                >
                                    {t('navbar.logout')}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
