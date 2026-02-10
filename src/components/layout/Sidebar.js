'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import { NAV_ITEMS } from '@/lib/constants';
import {
    LayoutDashboard,
    FileText,
    FolderKanban,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    FileStack,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const iconMap = {
    LayoutDashboard,
    FileText,
    FolderKanban,
    Settings,
};

export default function Sidebar({ isCollapsed, onToggle }) {
    const pathname = usePathname();
    const { t, isRTL } = useI18n();
    const { logout, user } = useAuth();

    const CollapseIcon = isRTL
        ? (isCollapsed ? ChevronLeft : ChevronRight)
        : (isCollapsed ? ChevronRight : ChevronLeft);

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 bottom-0 z-50 flex flex-col glass-surface overflow-hidden"
            style={{
                [isRTL ? 'right' : 'left']: 0,
            }}
        >
            {/* Logo Section */}
            <div className={`flex items-center gap-4 border-b border-white/5 ${isCollapsed ? 'justify-center px-4' : 'px-6'}`} style={{ height: 'var(--navbar-height)' }}>
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/20">
                    <FileStack className="h-5.5 w-5.5 text-white" />
                </div>
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <h1 className="text-lg font-bold tracking-tight text-white">
                                {t('app_short')}
                            </h1>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{t('app_name')}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-3 mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500"
                        >
                            {t('sidebar.menu') || 'Navigation'}
                        </motion.p>
                    )}
                </AnimatePresence>

                {NAV_ITEMS.map((item) => {
                    const Icon = iconMap[item.icon] || LayoutDashboard;
                    const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

                    return (
                        <Link key={item.key} href={item.path}>
                            <motion.div
                                whileHover={{ scale: 1.02, x: isRTL ? -4 : 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative flex items-center gap-4 rounded-xl px-3 py-3.5 transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-white/10 text-white shadow-xl shadow-black/10'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavIndicator"
                                        className={`absolute ${isRTL ? '-right-1' : '-left-1'} top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]`}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300
                                    ${isActive
                                        ? 'bg-indigo-500/20 text-indigo-400'
                                        : 'text-slate-400 group-hover:text-white group-hover:scale-110'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="overflow-hidden whitespace-nowrap text-sm font-semibold tracking-tight"
                                        >
                                            {t(`sidebar.${item.key}`)}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Profiles Section */}
            <div className="border-t border-white/5 p-4 space-y-3">
                <div className={`flex items-center gap-4 rounded-2xl p-3 bg-white/5 border border-white/5 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 font-bold shadow-lg shadow-emerald-500/20 text-white">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="min-w-0 flex-1"
                            >
                                <p className="text-sm font-bold text-white truncate">
                                    {user?.fullName || 'User'}
                                </p>
                                <p className="text-[10px] font-medium text-slate-500 truncate uppercase tracking-tight">
                                    {user?.userId || ''}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={logout}
                        className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-3 text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-400 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="h-5 w-5" />
                        {!isCollapsed && <span className="text-sm font-bold tracking-tight">{t('navbar.logout')}</span>}
                    </button>

                    <button
                        onClick={onToggle}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <CollapseIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </motion.aside>
    );
}
