'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/ui/PageHeader';
import { User, Globe, Palette, Save, Check, Mail, Shield, Camera, Lock, Bell, Languages, Eye, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
    const { t, locale, setLocale, isRTL } = useI18n();
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const tabs = [
        { id: 'profile', label: t('settings.profile') || 'My Profile', icon: User },
        { id: 'preferences', label: t('settings.preferences') || 'Preferences', icon: Palette },
        { id: 'security', label: t('settings.security') || 'Security', icon: Lock },
        { id: 'notifications', label: t('settings.notifications') || 'Notifications', icon: Bell },
    ];

    return (
        <div className="space-y-12">
            <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
            <div className="flex flex-col gap-12 lg:flex-row">
                {/* Navigation Sidebar */}
                <motion.div initial={{ opacity: 0, x: isRTL ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-80 flex-shrink-0">
                    <div className="glass-card p-2 space-y-1">
                        {tabs.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex w-full items-center gap-4 rounded-xl px-5 py-4 text-sm font-bold transition-all duration-300 group ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}><tab.icon className="h-4 w-4" /></div>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Dynamic Content */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1">
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-10 space-y-10">
                                <div className="flex flex-col sm:flex-row items-center gap-10">
                                    <div className="relative group">
                                        <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-violet-600 text-5xl font-black text-white shadow-2xl shadow-indigo-500/30 transform group-hover:scale-105 transition-transform duration-500">
                                            <div className="absolute inset-0 rounded-[2.5rem] bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {user?.fullName?.charAt(0) || 'U'}
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 border-2 border-white/10 text-slate-300 hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-black/20"><Camera className="h-5 w-5" /></button>
                                    </div>
                                    <div className="text-center sm:text-left rtl:sm:text-right space-y-2">
                                        <h3 className="text-2xl font-black text-white tracking-tight">{user?.fullName || 'User'}</h3>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{user?.userId || ''}</p>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                                            <span className="rounded-xl bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/20">System Admin</span>
                                            <span className="rounded-xl bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20">Verified</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="space-y-3"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><User className="h-3 w-3" />{t('settings.name') || 'Full Name'}</label><input type="text" value={user?.fullName || ''} readOnly className="w-full h-14 bg-white/5 border-white/10 text-white font-bold cursor-not-allowed opacity-50 px-6" /></div>
                                    <div className="space-y-3"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><Mail className="h-3 w-3" />{t('settings.email') || 'Email Address'}</label><input type="email" value={user?.userId || ''} readOnly className="w-full h-14 bg-white/5 border-white/10 text-white font-bold cursor-not-allowed opacity-50 px-6" /></div>
                                    <div className="space-y-3 md:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><Shield className="h-3 w-3" />{t('settings.role') || 'System Role'}</label><input type="text" value={user?.isSystemUser ? 'System Administrator' : 'Authorized Personnel'} readOnly className="w-full h-14 bg-white/5 border-white/10 text-white font-bold cursor-not-allowed opacity-50 px-6" /></div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'preferences' && (
                            <motion.div key="preferences" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-10 space-y-12">
                                <div className="space-y-8">
                                    <h3 className="text-xl font-black text-white flex items-center gap-4"><div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20"><Languages className="h-6 w-6 text-indigo-400" /></div>{t('settings.language')}</h3>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        {[{ code: 'ar', label: t('settings.arabic'), flag: '🇸🇦', desc: 'اللغة العربية كخيار افتراضي' }, { code: 'en', label: t('settings.english'), flag: '🇬🇧', desc: 'Global business standard' }].map((lang) => (
                                            <button key={lang.code} onClick={() => setLocale(lang.code)} className={`group relative flex items-start gap-5 rounded-3xl p-6 text-left rtl:text-right transition-all duration-300 border-2 ${locale === lang.code ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-500/20' : 'bg-white/[0.03] text-slate-400 border-white/5 hover:border-white/10 hover:bg-white/[0.05]'}`}>
                                                <span className="text-4xl group-hover:scale-110 transition-transform">{lang.flag}</span>
                                                <div className="space-y-1"><span className={`block text-lg font-black ${locale === lang.code ? 'text-white' : 'text-slate-200'}`}>{lang.label}</span><span className={`text-[10px] font-bold uppercase tracking-wider ${locale === lang.code ? 'text-indigo-200' : 'text-slate-500'}`}>{lang.desc}</span></div>
                                                {locale === lang.code && <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center"><Check className="h-4 w-4 text-white" /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="space-y-8">
                                    <h3 className="text-xl font-black text-white flex items-center gap-4"><div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20"><Eye className="h-6 w-6 text-violet-400" /></div>{t('settings.theme')}</h3>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <button className="group flex items-center gap-5 rounded-3xl bg-indigo-600/10 border-2 border-indigo-500/30 p-6 text-white transition-all"><div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-indigo-500 shadow-xl shadow-indigo-500/20"><Moon className="h-7 w-7 text-white" /></div><div className="text-left rtl:text-right"><span className="block text-lg font-black">{t('settings.dark')}</span><span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Current Theme</span></div><Check className="h-5 w-5 text-indigo-400 ms-auto" /></button>
                                        <button className="flex items-center gap-5 rounded-3xl bg-white/[0.03] border-2 border-white/5 p-6 text-slate-600 cursor-not-allowed opacity-30"><div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-slate-800"><Sun className="h-7 w-7" /></div><div className="text-left rtl:text-right"><span className="block text-lg font-black">{t('settings.light')}</span><span className="text-[10px] font-bold uppercase tracking-widest">Coming Soon</span></div></button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {saved && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="mt-8 flex items-center justify-center gap-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-8 py-5 text-sm font-black text-emerald-400 shadow-2xl shadow-emerald-500/10">
                                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"><Check className="h-4 w-4 text-white" /></div>
                                {t('settings.saved') || 'Changes Saved Successfully'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
