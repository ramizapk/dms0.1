'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/hooks/useAuth';
import {
    Bell,
    ChevronDown,
    Settings,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    Languages,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import NotificationDropdown from '@/components/ui/NotificationDropdown';

export default function Navbar({ isSidebarCollapsed, onToggleSidebar, onMobileMenuOpen }) {
    const { t, locale, setLocale, isRTL } = useI18n();
    const { user, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const ToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

    const isEnglish = locale === 'en';

    return (
        <header
            className="navbar"
            style={{ height: 'var(--navbar-height)' }}
        >
            <div className="navbar__inner">
                {/* Left Section: Toggle + Page Context */}
                <div className="navbar__left">
                    {/* Desktop Sidebar Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleSidebar}
                        className="navbar__sidebar-toggle navbar__sidebar-toggle--desktop"
                        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <ToggleIcon className="h-5 w-5" />
                    </motion.button>

                    {/* Mobile Hamburger */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onMobileMenuOpen}
                        className="navbar__sidebar-toggle navbar__sidebar-toggle--mobile"
                    >
                        <Menu className="h-5 w-5" />
                    </motion.button>

                    {/* Page Welcome Text */}
                    <div className="navbar__welcome">
                        <p className="navbar__welcome-greeting">
                            {t('navbar.welcome') || 'Welcome back'} 👋
                        </p>
                        <p className="navbar__welcome-name">
                            {user?.fullName || 'User'}
                        </p>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="navbar__right">
                    {/* Premium Language Switcher */}
                    <div className="lang-switcher">
                        <div className="lang-switcher__track">
                            {/* Sliding indicator */}
                            <motion.div
                                className="lang-switcher__indicator"
                                layout
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                style={{
                                    [isEnglish ? 'left' : 'right']: '3px',
                                    [isEnglish ? 'right' : 'left']: 'auto',
                                }}
                            />

                            {/* English Option */}
                            <button
                                onClick={() => setLocale('en')}
                                className={`lang-switcher__option ${isEnglish ? 'lang-switcher__option--active' : ''}`}
                            >
                                <span className="lang-switcher__flag">🇺🇸</span>
                                <span className="lang-switcher__label">EN</span>
                            </button>

                            {/* Arabic Option */}
                            <button
                                onClick={() => setLocale('ar')}
                                className={`lang-switcher__option ${!isEnglish ? 'lang-switcher__option--active' : ''}`}
                            >
                                <span className="lang-switcher__flag">🇸🇦</span>
                                <span className="lang-switcher__label">عر</span>
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <NotificationDropdown />

                    {/* Divider */}
                    <div className="navbar__divider" />

                    {/* User Menu */}
                    <div className="navbar__user-menu" ref={menuRef}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="navbar__user-btn"
                        >
                            <div className="navbar__user-info">
                                <p className="navbar__user-name">{user?.fullName || 'User'}</p>
                                <p className="navbar__user-role">Administrator</p>
                            </div>
                            <div className="navbar__user-avatar relative overflow-hidden">
                                {user?.userImage ? (
                                    <Image
                                        src={user.userImage.startsWith('http') ? user.userImage : `https://dms.salasah.sa${user.userImage}`}
                                        alt={user?.fullName || 'User'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    user?.fullName?.charAt(0) || 'U'
                                )}
                            </div>
                            <ChevronDown className={`navbar__user-chevron ${isUserMenuOpen ? 'navbar__user-chevron--open' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="navbar__dropdown"
                                >
                                    {/* Dropdown user card */}
                                    <div className="navbar__dropdown-user">
                                        <div className="navbar__dropdown-user-avatar relative overflow-hidden">
                                            {user?.userImage ? (
                                                <Image
                                                    src={user.userImage.startsWith('http') ? user.userImage : `https://dms.salasah.sa${user.userImage}`}
                                                    alt={user?.fullName || 'User'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                user?.fullName?.charAt(0) || 'U'
                                            )}
                                        </div>
                                        <div>
                                            <p className="navbar__dropdown-user-name">{user?.fullName || 'User'}</p>
                                            <p className="navbar__dropdown-user-id">{user?.userId}</p>
                                        </div>
                                    </div>

                                    <div className="navbar__dropdown-divider" />

                                    <Link
                                        href="/settings"
                                        className="navbar__dropdown-item"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <div className="navbar__dropdown-item-icon">
                                            <Settings className="h-4 w-4" />
                                        </div>
                                        {t('navbar.settings')}
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="navbar__dropdown-item navbar__dropdown-item--danger"
                                    >
                                        <div className="navbar__dropdown-item-icon navbar__dropdown-item-icon--danger">
                                            <LogOut className="h-4 w-4" />
                                        </div>
                                        {t('navbar.logout')}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
