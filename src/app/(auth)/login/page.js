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
        <div className="login-bg relative flex min-h-screen items-center justify-center px-4">
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-violet-500/10"
                        style={{
                            width: Math.random() * 200 + 50,
                            height: Math.random() * 200 + 50,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    />
                ))}
            </div>

            {/* Language Toggle */}
            <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLocale}
                className="absolute top-6 end-6 z-10 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
            >
                <Globe className="h-4 w-4" />
                {locale === 'ar' ? 'English' : 'العربية'}
            </motion.button>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Card glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-teal-600/20 blur-xl" />

                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
                    {/* Top gradient line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-teal-500" />

                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 animate-pulse-glow"
                    >
                        <FileStack className="h-8 w-8 text-white" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-2xl font-bold text-white">{t('login.title')}</h1>
                        <p className="mt-2 text-sm text-slate-400">{t('login.subtitle')}</p>
                    </motion.div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"
                        >
                            {t('login.error')}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                {t('login.username')}
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setFieldErrors(f => ({ ...f, username: undefined })); setError(null); }}
                                className={`w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${fieldErrors.username
                                        ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/25'
                                        : 'border-slate-700/50 focus:border-violet-500/50 focus:ring-violet-500/25'
                                    }`}
                                placeholder={t('login.username')}
                            />
                            {fieldErrors.username && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-1.5 text-xs text-rose-400"
                                >
                                    {fieldErrors.username}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                {t('login.password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); setError(null); }}
                                    className={`w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${fieldErrors.password
                                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/25'
                                            : 'border-slate-700/50 focus:border-violet-500/50 focus:ring-violet-500/25'
                                        }`}
                                    placeholder={t('login.password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-1.5 text-xs text-rose-400"
                                >
                                    {fieldErrors.password}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            {t('login.loading')}
                                        </>
                                    ) : (
                                        <>
                                            {t('login.submit')}
                                            <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </motion.div>
                    </form>

                    {/* Bottom decoration */}
                    <div className="mt-8 flex items-center justify-center gap-1.5">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                initial={{ width: 6 }}
                                animate={{ width: i === 1 ? 24 : 6 }}
                                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', delay: i * 0.3 }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
