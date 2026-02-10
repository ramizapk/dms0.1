'use client';

import { motion } from 'framer-motion';

export default function LoadingSkeleton({ rows = 5, columns = 4, type = 'table' }) {
    if (type === 'cards') {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative overflow-hidden rounded-2xl bg-slate-800/50 p-5 h-28"
                    >
                        <div className="space-y-3">
                            <div className="h-3 w-24 rounded-full bg-slate-700 animate-pulse" />
                            <div className="h-8 w-16 rounded-lg bg-slate-700 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/30">
            {/* Header */}
            <div className="flex gap-4 border-b border-slate-700/50 p-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={i} className="h-3 flex-1 rounded-full bg-slate-700 animate-pulse" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-4 border-b border-slate-700/20 p-4 last:border-0">
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <div
                            key={colIdx}
                            className="h-3 flex-1 rounded-full bg-slate-700/50 animate-pulse"
                            style={{ animationDelay: `${(rowIdx + colIdx) * 100}ms` }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
