'use client';

import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, icon: CustomIcon }) {
    const Icon = CustomIcon || Inbox;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
        >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <Icon className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-slate-500 font-medium">{description}</p>
            )}
        </motion.div>
    );
}
