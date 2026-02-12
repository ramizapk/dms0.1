'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/hooks/useAuth';
import { FileStack, Eye, EyeOff, Globe, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { t, toggleLocale, locale, isRTL } = useI18n();
    const { login, isLoading, error, setError } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        const errors = {};
        if (!username.trim()) errors.username = t('login.username_required');
        if (!password.trim()) errors.password = t('login.password_required');

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        await login(username, password);
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 px-4">
            {/* Abstract Background Shapes - Professional & Subtle */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] start-[-5%] h-[500px] w-[500px] rounded-full bg-violet-200/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] end-[-5%] h-[500px] w-[500px] rounded-full bg-indigo-200/20 blur-[100px]" />
                <div className="absolute top-[20%] end-[10%] h-[300px] w-[300px] rounded-full bg-slate-200/30 blur-[80px]" />
            </div>

            {/* Language Toggle - Top Corner */}
            <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLocale}
                className="absolute top-6 end-6 z-20 flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-slate-900 hover:shadow-md"
            >
                <Globe className="h-4 w-4" />
                {locale === 'ar' ? 'English' : 'العربية'}
            </motion.button>

            {/* Login Card - Clean, Spacious, Professional */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-[480px]"
            >
                <div className="relative overflow-hidden rounded-[32px] bg-white p-10 shadow-2xl ring-1 ring-slate-900/5 sm:p-12">

                    {/* Brand Header */}
                    <div className="mb-10 text-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20"
                        >
                            <FileStack className="h-10 w-10 text-white" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold tracking-tight text-slate-900"
                        >
                            {t('login.title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-3 text-base text-slate-500"
                        >
                            {t('login.subtitle')}
                        </motion.p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-8 overflow-hidden rounded-xl border border-rose-100 bg-rose-50 px-4 py-3"
                        >
                            <div className="flex items-center gap-3 text-sm font-medium text-rose-600">
                                <div className="h-2 w-2 rounded-full bg-rose-500" />
                                {t('login.error')}
                            </div>
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                {t('login.username')}
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setFieldErrors(f => ({ ...f, username: undefined })); setError(null); }}
                                className={`w-full rounded-xl border px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-4 ${fieldErrors.username
                                    ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
                                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:border-violet-500 focus:bg-white focus:ring-violet-100'
                                    }`}
                                placeholder={t('login.username')}
                            />
                            {fieldErrors.username && (
                                <p className="mt-2 text-xs font-medium text-rose-500">
                                    {fieldErrors.username}
                                </p>
                            )}
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                {t('login.password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); setError(null); }}
                                    className={`w-full rounded-xl border px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-4 ${fieldErrors.password
                                        ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
                                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:border-violet-500 focus:bg-white focus:ring-violet-100'
                                        }`}
                                    placeholder={t('login.password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute top-1/2 -translate-y-1/2 p-2 text-slate-400 transition-colors hover:text-slate-600 ${isRTL ? 'left-2' : 'right-2'}`}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="mt-2 text-xs font-medium text-rose-500">
                                    {fieldErrors.password}
                                </p>
                            )}
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="pt-2"
                        >
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            {t('login.loading')}
                                        </>
                                    ) : (
                                        <>
                                            {t('login.submit')}
                                            <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </motion.div>
                    </form>

                    {/* Footer / Copyright */}
                    <div className="mt-10 text-center text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} DMS System. All rights reserved.
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
