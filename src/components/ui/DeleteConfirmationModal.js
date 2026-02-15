import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n/provider';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, isDeleting }) {
    const { t } = useI18n();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Manage body scroll
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto'; // Re-enable scroll when closed but not yet unmounted
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]); // Depend on isOpen

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-all"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
                >
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-6 w-6 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                    {title || t('common.confirm_delete') || 'Delete Item'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {message || t('common.delete_warning') || 'Are you sure you want to delete this item? This action cannot be undone.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
