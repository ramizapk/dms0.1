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
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 rounded-full bg-indigo-500" />
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">{title}</h1>
                </div>
                {subtitle && (
                    <p className="text-base text-slate-500 font-medium pl-4.5 rtl:pr-4.5 border-l rtl:border-r border-white/10 leading-relaxed max-w-2xl">
                        {subtitle}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 animate-in">
                    {actions}
                </div>
            )}
        </motion.div>
    );
}
