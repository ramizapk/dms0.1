'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import * as LucideIcons from 'lucide-react';

export default function StatsCard({ label, value, icon, gradient, shadowColor, index = 0 }) {
    const { isRTL } = useI18n();
    const Icon = LucideIcons[icon] || LucideIcons.FileStack;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`relative group overflow-hidden glass-card p-8 cursor-default`}
            style={{ minHeight: '160px' }}
        >
            {/* Background Gradient Layer */}
            <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />

            {/* Ambient Glow */}
            <div className={`absolute ${isRTL ? '-left-12' : '-right-12'} -top-12 h-40 w-40 rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500 bg-white`} />

            <div className="relative flex items-center justify-between h-full">
                <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${gradient}`} />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">{label}</p>
                    </div>

                    <motion.p
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.3, type: 'spring' }}
                        className="text-5xl font-extrabold text-white tracking-tighter"
                    >
                        {value?.toLocaleString() ?? 0}
                    </motion.p>
                </div>

                <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${isRTL ? 'mr-6' : 'ml-6'}`}>
                    <Icon className="h-8 w-8 text-white opacity-80 group-hover:opacity-100" />
                </div>
            </div>

            {/* Premium Shimmer */}
            <motion.div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ translateX: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 6, ease: "linear" }}
            />

            {/* Bottom Accent */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-30`} />
        </motion.div>
    );
}
