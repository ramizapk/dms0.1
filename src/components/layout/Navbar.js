'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/hooks/useAuth';
import {
    Search,
    Bell,
    Globe,
    ChevronDown,
    User,
    Settings,
    LogOut,
} from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
    const { t, toggleLocale, locale, isRTL } = useI18n();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header
            className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-2xl px-8"
            style={{ height: 'var(--navbar-height)' }}
        >
            {/* Search Bar Group */}
            <div className="flex items-center flex-1 max-w-xl">
                <motion.div
                    animate={{
                        width: searchFocused ? '100%' : '320px',
                        scale: searchFocused ? 1.02 : 1
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="relative group"
                >
                    <div className={`absolute top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center transition-colors ${searchFocused ? 'text-indigo-400' : 'text-slate-500'} ${isRTL ? 'right-0' : 'left-0'}`}>
                        <Search className="h-4.5 w-4.5" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('navbar.search')}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className={`w-full py-3 h-11 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-white placeholder-slate-500 outline-none transition-all focus:bg-white/10 focus:border-indigo-500/30 ${isRTL ? 'pr-12 pl-6' : 'pl-12 pr-6'}`}
                    />
                </motion.div>
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-4">
                {/* Language Utility */}
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleLocale}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:text-white"
                >
                    <Globe className="h-4.5 w-4.5 text-indigo-400" />
                    <span>{t('navbar.language')}</span>
                </motion.button>

                {/* Notification Utility */}
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/10"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white ring-4 ring-slate-900 shadow-md">
                        3
                    </span>
                </motion.button>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-white/5 mx-2" />

                {/* User Profile Hook */}
                <div className="relative" ref={menuRef}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-3 py-2 transition-all hover:bg-white/10"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-xl shadow-indigo-500/20">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="hidden text-left sm:block">
                            <p className="text-xs font-bold text-white leading-none uppercase tracking-wide truncate max-w-[100px]">
                                {user?.fullName || 'User'}
                            </p>
                            <span className="text-[10px] font-medium text-slate-500 tracking-tight">
                                {user?.userId || ''}
                            </span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                        {showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                className={`absolute top-full mt-4 w-64 overflow-hidden rounded-2xl glass-surface border border-white/10 shadow-2xl ${isRTL ? 'left-0' : 'right-0'}`}
                            >
                                <div className="border-b border-white/5 bg-white/5 px-6 py-5">
                                    <p className="text-sm font-bold text-white">{user?.fullName || 'User'}</p>
                                    <p className="text-xs font-medium text-slate-500 mt-1">{user?.userId || ''}</p>
                                </div>
                                <div className="p-2">
                                    <Link
                                        href="/settings"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/5 hover:text-white"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                                            <User className="h-4 w-4" />
                                        </div>
                                        {t('navbar.profile')}
                                    </Link>
                                    <Link
                                        href="/settings"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/5 hover:text-white"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                                            <Settings className="h-4 w-4" />
                                        </div>
                                        {t('navbar.settings')}
                                    </Link>
                                </div>
                                <div className="border-t border-white/5 p-2 bg-rose-500/5">
                                    <button
                                        onClick={() => { setShowUserMenu(false); logout(); }}
                                        className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold text-rose-400 transition-all hover:bg-rose-500/10"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
                                            <LogOut className="h-4 w-4" />
                                        </div>
                                        {t('navbar.logout')}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
