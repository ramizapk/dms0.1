'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import * as LucideIcons from 'lucide-react';

export default function StatsCard({ label, value, icon, gradient = 'from-indigo-500 to-violet-500', index = 0 }) {
    const { isRTL } = useI18n();
    const Icon = LucideIcons[icon] || LucideIcons.FileStack;

    // Enhanced Theme Logic with specific support for all statuses
    const getTheme = (grad) => {
        if (grad.includes('rose') || grad.includes('red')) return {
            solid: 'bg-rose-500',
            text: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            light: 'bg-rose-100/50',
            shadow: 'shadow-rose-500/10'
        };
        if (grad.includes('amber') || grad.includes('orange')) return {
            solid: 'bg-amber-500',
            text: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            light: 'bg-amber-100/50',
            shadow: 'shadow-amber-500/10'
        };
        if (grad.includes('sky') || grad.includes('blue')) return {
            solid: 'bg-sky-500',
            text: 'text-sky-600',
            bg: 'bg-sky-50',
            border: 'border-sky-100',
            light: 'bg-sky-100/50',
            shadow: 'shadow-sky-500/10'
        };
        if (grad.includes('emerald') || grad.includes('teal')) return {
            solid: 'bg-emerald-500',
            text: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            light: 'bg-emerald-100/50',
            shadow: 'shadow-emerald-500/10'
        };
        return {
            solid: 'bg-indigo-500',
            text: 'text-indigo-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            light: 'bg-indigo-100/50',
            shadow: 'shadow-indigo-500/10'
        };
    };

    const theme = getTheme(gradient);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
            {/* Top Border Accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

            {/* Background Decor */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${theme.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <Icon className={`absolute -right-4 -bottom-4 h-28 w-28 ${theme.text} opacity-[0.04] rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12`} strokeWidth={1} />

            <div className="relative z-10 flex flex-col h-full gap-8">
                {/* Header: Icon & Trend */}
                <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.bg} ${theme.border} border shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-6 w-6 ${theme.text}`} strokeWidth={2.5} />
                    </div>

                    {/* Activity Pill */}
                    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${theme.bg} ${theme.text} border ${theme.border}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${theme.solid} animate-pulse`} />
                        <span>Live</span>
                    </div>
                </div>

                {/* Content: Value & Label */}
                <div>
                    <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight leading-none group-hover:text-slate-900 transition-colors">
                        {value?.toLocaleString() ?? 0}
                    </h3>
                    <p className="mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {label}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
