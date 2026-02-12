'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X, Bell } from 'lucide-react';
import { useEffect } from 'react';
import { useI18n } from '@/i18n/provider';

export default function Toast({ message, type = 'success', onClose, duration = 5000 }) {
    const { isRTL } = useI18n();

    useEffect(() => {
        if (message && duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="fixed top-6 right-6 z-[99999] flex items-center gap-4 pl-4 pr-3 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl border-2 min-w-[340px] max-w-md overflow-hidden"
                    style={{
                        backgroundColor: type === 'success' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                        borderColor: type === 'success' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)',
                    }}
                >
                    {/* Background Glow */}
                    <div className={`absolute inset-0 opacity-5 pointer-events-none ${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />

                    <div className={`shrink-0 rounded-xl p-2.5 ${type === 'success'
                        ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100'
                        : 'bg-rose-50 text-rose-600 shadow-sm border border-rose-100'
                        }`}>
                        {type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <XCircle className="w-5 h-5" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black tracking-tight ${type === 'success' ? 'text-emerald-950' : 'text-rose-950'
                            }`}>
                            {type === 'success' ? (isRTL ? 'تم بنجاح' : 'Success') : (isRTL ? 'خطأ' : 'Error')}
                        </p>
                        <p
                            className="text-[13px] font-bold text-slate-500 mt-0.5 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: message }}
                        />
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100/50">
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: duration / 1000, ease: "linear" }}
                            className={`h-full ${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
