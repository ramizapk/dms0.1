'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import ImageUpload from '@/components/ui/SettingsImageUpload';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import {
    User,
    Palette,
    Save,
    Lock,
    X,
    Loader2,
    Languages,
    Moon,
    Sun,
    Eye,
    EyeOff,
    Shield,
    LogOut,
    Check,
    AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
    const { t, locale, setLocale, isRTL } = useI18n();
    const { user, logout } = useAuth(); // We might need logout for password change
    const [activeTab, setActiveTab] = useState('profile');
    const { showToast } = useToast();

    // -- Profile Form State --
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSubmitting, setProfileSubmitting] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Dynamic Options
    const [roleProfiles, setRoleProfiles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);

    const initialProfileState = {
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        mobile_no: '',
        party: '',
        role_profile_name: '',
        department: '',
        designation: '',
        language: 'ar',
        user_image: '',
        digital_signature: '',
        digital_stamp: '',
    };

    const [profileData, setProfileData] = useState(initialProfileState);
    const [profileErrors, setProfileErrors] = useState({});

    // -- Password Form State --
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '', // Client-side only
        logout_all_sessions: true
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // -- Fetch Data for Profile --
    useEffect(() => {
        if (!user?.userId) return;

        async function fetchData() {
            try {
                setProfileLoading(true);
                const [userRes, rolesRes, deptsRes, desigsRes] = await Promise.all([
                    api.getUser(user.userId),
                    api.getRoleProfiles(),
                    api.getDepartments(),
                    api.getDesignations()
                ]);

                if (userRes.data) {
                    const userData = userRes.data;
                    setProfileData({
                        first_name: userData.first_name || '',
                        middle_name: userData.middle_name || '',
                        last_name: userData.last_name || '',
                        email: userData.email || '',
                        mobile_no: userData.mobile_no || '',
                        party: userData.party || '',
                        role_profile_name: userData.role_profile_name || '',
                        department: userData.department || '',
                        designation: userData.designation || '',
                        language: userData.language || 'ar',
                        user_image: userData.user_image || '',
                        digital_signature: userData.digital_signature || '',
                        digital_stamp: userData.digital_stamp || '',
                    });
                }

                setRoleProfiles(rolesRes.data || []);
                setDepartments(deptsRes.data || []);
                setDesignations(desigsRes.data || []);
            } catch (err) {
                console.error('Failed to fetch profile data', err);
                showToast(t('common.error'), 'error');
            } finally {
                setProfileLoading(false);
                setLoadingOptions(false);
            }
        }

        fetchData();
    }, [user?.userId, showToast, t]);

    // -- Profile Handlers --
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        if (profileErrors[name]) {
            setProfileErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileSubmitting(true);
        setProfileErrors({});

        try {
            await api.updateUser(user.userId, profileData);
            showToast(t('settings.saved'), 'success');
        } catch (err) {
            console.error('Failed to update profile', err);
            let newErrors = {};
            let toastMessage = err.message || t('common.error');

            const messages = err.serverMessages || [];
            if (messages.length > 0) {
                toastMessage = messages[0].message || toastMessage;
            }

            setProfileErrors(newErrors);
            showToast(toastMessage, 'error');
        } finally {
            setProfileSubmitting(false);
        }
    };

    // -- Password Handlers --
    const handlePasswordChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordSubmitting(true);
        setPasswordErrors({});

        // Basic Validation
        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordErrors({ confirm_password: t('settings.password_mismatch') || "Passwords do not match" });
            setPasswordSubmitting(false);
            return;
        }

        if (passwordData.new_password.length < 6) { // Assuming a min length
            setPasswordErrors({ new_password: t('settings.password_too_short') || "Password must be at least 6 characters" });
            setPasswordSubmitting(false);
            return;
        }

        try {
            const payload = {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
                logout_all_sessions: passwordData.logout_all_sessions ? 1 : 0
            };

            await api.updatePassword(payload);
            showToast(t('settings.password_updated') || "Password updated successfully", 'success');

            // Clear form
            setPasswordData({
                old_password: '',
                new_password: '',
                confirm_password: '',
                logout_all_sessions: true
            });

            // If logout all sessions was checked, maybe we should warn or redirect?
            // The API response returns "home_page", typically implying valid session or redirect.
            // If the user checked logout_all_sessions, the current session MIGHT be invalid if the backend invalidates it too,
            // but usually the current token/session is kept or refreshed.
            // If the backend invalidates THIS session, the axios interceptor or next API call will catch 401. 
            // The prompt says "logout_all_sessions: 1", usually means OTHER sessions.

        } catch (err) {
            console.error('Failed to update password', err);
            let toastMessage = err.message || t('common.error');
            // Handle specific password errors if any
            showToast(toastMessage, 'error');
        } finally {
            setPasswordSubmitting(false);
        }
    };


    // -- UI Helpers --
    const parties = ['Contractor', 'Consultant', 'Owner'];

    const renderInput = (name, type = 'text', required = false, labelKey = null, disabled = false) => {
        const key = labelKey || name;
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {t(`users.fields.${key}`) || key}
                </label>
                <input
                    type={type}
                    name={name}
                    value={profileData[name]}
                    onChange={handleProfileChange}
                    required={required}
                    disabled={disabled}
                    className={`w-full rounded-xl border-white/10 bg-white/5 p-3 text-sm font-bold text-white outline-none focus:ring-4 transition-all 
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${profileErrors[name]
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500/50 focus:ring-indigo-500/20'
                        }`}
                    placeholder={t(`users.placeholders.${key.replace('_no', '')}`) || ''}
                />
                {profileErrors[name] && (
                    <p className="text-xs text-red-400 font-black flex items-center gap-1 animate-in slide-in-from-top-1 pr-1">
                        <X className="w-3.5 h-3.5" />
                        {profileErrors[name]}
                    </p>
                )}
            </div>
        );
    };

    const renderSelect = (name, options, loading, labelKey = null, disabled = false) => {
        const key = labelKey || name;
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {t(`users.fields.${key}`) || key}
                </label>
                <div className="relative">
                    <select
                        name={name}
                        value={profileData[name]}
                        onChange={handleProfileChange}
                        disabled={loading || disabled}
                        required={true}
                        className={`w-full rounded-xl border-white/10 bg-white/5 p-3 text-sm font-bold text-white outline-none focus:ring-4 transition-all appearance-none 
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            ${profileErrors[name]
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                                : 'focus:border-indigo-500/50 focus:ring-indigo-500/20'
                            }`}
                    >
                        <option value="" className="bg-slate-900">{t('users.placeholders.select') || 'Select...'}</option>
                        {options.map(opt => (
                            <option key={opt.value || opt.name || opt} value={opt.value || opt.name || opt} className="bg-slate-900">
                                {opt.label || opt.name || opt}
                            </option>
                        ))}
                    </select>
                </div>
                {profileErrors[name] && (
                    <p className="text-xs text-red-400 font-black flex items-center gap-1 animate-in slide-in-from-top-1 pr-1">
                        <X className="w-3.5 h-3.5" />
                        {profileErrors[name]}
                    </p>
                )}
            </div>
        );
    };

    const tabs = [
        { id: 'profile', label: t('settings.profile') || 'My Profile', icon: User },
        { id: 'security', label: t('settings.security') || 'Security', icon: Lock },
        { id: 'preferences', label: t('settings.preferences') || 'Preferences', icon: Palette },
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
                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-10 space-y-8">
                                {profileLoading ? (
                                    <div className="flex items-center justify-center p-20">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                    </div>
                                ) : (
                                    <form onSubmit={handleProfileSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {renderInput('first_name', 'text', true)}
                                            {renderInput('middle_name', 'text')}
                                            {renderInput('last_name', 'text', true)}

                                            {renderInput('email', 'email', true, null, true)} {/* Read Only */}
                                            {renderInput('mobile_no', 'tel', false, 'mobile')}
                                            {renderSelect('party', parties, false, null, true)} {/* Read Only */}

                                            {renderSelect('role_profile_name', roleProfiles, loadingOptions, 'role_profile', true)}
                                            {renderSelect('department', departments, loadingOptions, null, true)}
                                            {renderSelect('designation', designations, loadingOptions, null, true)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                                            <ImageUpload
                                                label={t('users.fields.user_image')}
                                                value={profileData.user_image}
                                                onChange={(url) => setProfileData(prev => ({ ...prev, user_image: url }))}
                                                onRemove={() => setProfileData(prev => ({ ...prev, user_image: '' }))}
                                            />
                                            <ImageUpload
                                                label={t('users.fields.digital_signature')}
                                                value={profileData.digital_signature}
                                                onChange={(url) => setProfileData(prev => ({ ...prev, digital_signature: url }))}
                                                onRemove={() => setProfileData(prev => ({ ...prev, digital_signature: '' }))}
                                            />
                                            <ImageUpload
                                                label={t('users.fields.digital_stamp')}
                                                value={profileData.digital_stamp}
                                                onChange={(url) => setProfileData(prev => ({ ...prev, digital_stamp: url }))}
                                                onRemove={() => setProfileData(prev => ({ ...prev, digital_stamp: '' }))}
                                            />
                                        </div>

                                        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <p>{t('settings.transparent_images_note')}</p>
                                        </div>

                                        <div className="pt-8 flex items-center justify-end gap-4 border-t border-white/5">
                                            <button
                                                type="submit"
                                                disabled={profileSubmitting}
                                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
                                            >
                                                {profileSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        {t('common.save') || 'Save Changes'}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </motion.div>
                        )}

                        {/* SECURITY TAB (PASSWORD) */}
                        {activeTab === 'security' && (
                            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-10 space-y-8">
                                <form onSubmit={handlePasswordSubmit} className="max-w-2xl space-y-6">
                                    <div className="flex items-center gap-4 pb-6 border-b border-white/5 mb-8">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                            <Shield className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white">{t('settings.change_password') || "Change Password"}</h3>
                                            <p className="text-sm text-slate-400 font-medium">{t('settings.password_desc') || "Ensure your account is using a long, random password to stay secure."}</p>
                                        </div>
                                    </div>

                                    {/* Old Password */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            {t('settings.old_password') || "Current Password"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showOldPassword ? 'text' : 'password'}
                                                name="old_password"
                                                value={passwordData.old_password}
                                                onChange={handlePasswordChange}
                                                required
                                                className={`w-full rounded-xl border-white/10 bg-white/5 p-3 text-sm font-bold text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-600`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOldPassword(!showOldPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors rtl:left-3 rtl:right-auto"
                                            >
                                                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            {t('settings.new_password') || "New Password"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                name="new_password"
                                                value={passwordData.new_password}
                                                onChange={handlePasswordChange}
                                                required
                                                className={`w-full rounded-xl border-white/10 bg-white/5 p-3 text-sm font-bold text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-600`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors rtl:left-3 rtl:right-auto"
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {passwordErrors.new_password && (
                                            <p className="text-xs text-red-400 font-bold mt-1">{passwordErrors.new_password}</p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            {t('settings.confirm_password') || "Confirm New Password"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                name="confirm_password"
                                                value={passwordData.confirm_password}
                                                onChange={handlePasswordChange}
                                                required
                                                className={`w-full rounded-xl border-white/10 bg-white/5 p-3 text-sm font-bold text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-600 ${passwordErrors.confirm_password ? 'border-red-500/50' : ''}`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {passwordErrors.confirm_password && (
                                            <p className="text-xs text-red-400 font-bold mt-1">{passwordErrors.confirm_password}</p>
                                        )}
                                    </div>

                                    {/* Logout Checkbox */}
                                    {/* Logout Toggle Switch */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id="logout_all_sessions"
                                                className="sr-only peer"
                                                checked={passwordData.logout_all_sessions}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, logout_all_sessions: e.target.checked }))}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                        </label>
                                        <label htmlFor="logout_all_sessions" className={`cursor-pointer text-sm font-bold select-none transition-colors ${passwordData.logout_all_sessions ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {t('settings.logout_all_sessions') || "Log out from all other devices"}
                                        </label>
                                    </div>

                                    <div className="pt-6 flex items-center justify-end border-t border-white/5 mt-4">
                                        <button
                                            type="submit"
                                            disabled={passwordSubmitting}
                                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
                                        >
                                            {passwordSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="h-4 w-4" />
                                                    {t('settings.update_password') || 'Update Password'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* PREFERENCES TAB */}
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
                                {/* 
  <div className="h-px bg-white/5" />
                                <div className="space-y-8">
                                    <h3 className="text-xl font-black text-white flex items-center gap-4"><div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20"><Eye className="h-6 w-6 text-violet-400" /></div>{t('settings.theme')}</h3>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <button className="group flex items-center gap-5 rounded-3xl bg-indigo-600/10 border-2 border-indigo-500/30 p-6 text-white transition-all"><div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-indigo-500 shadow-xl shadow-indigo-500/20"><Moon className="h-7 w-7 text-white" /></div><div className="text-left rtl:text-right"><span className="block text-lg font-black">{t('settings.dark')}</span><span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Current Theme</span></div><Check className="h-5 w-5 text-indigo-400 ms-auto" /></button>
                                        <button className="flex items-center gap-5 rounded-3xl bg-white/[0.03] border-2 border-white/5 p-6 text-slate-600 cursor-not-allowed opacity-30"><div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-slate-800"><Sun className="h-7 w-7" /></div><div className="text-left rtl:text-right"><span className="block text-lg font-black">{t('settings.light')}</span><span className="text-[10px] font-bold uppercase tracking-widest">Coming Soon</span></div></button>
                                    </div>
                                </div>
*/}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
