'use client';

import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, actions }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
            <div className="space-y-2">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20" />
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight lg:text-5xl">{title}</h1>
                </div>
                {subtitle && (
                    <div className="pl-5.5 rtl:pr-5.5 border-l-2 rtl:border-r-2 border-indigo-500/10 transition-colors hover:border-indigo-500/30">
                        <p className="text-lg text-slate-500 font-bold tracking-tight">
                            {subtitle}
                        </p>
                    </div>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-4  p-2 rounded-2xl border border-slate-100 shadow-sm animate-in">
                    {actions}
                </div>
            )}
        </motion.div>
    );
}
