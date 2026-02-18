'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import {
    UserPlus,
    Save,
    X,
    Loader2,
    Eye,
    EyeOff,
    Wand2
} from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToast } from '@/context/ToastContext';

export default function AddUserPage() {
    const { t, isRTL } = useI18n();
    const router = useRouter();
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    // Dynamic Options
    const [roleProfiles, setRoleProfiles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);

    // Form State
    const initialFormState = {
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        password: '', // Added password field
        mobile_no: '',
        party: '',
        user_category: '',
        role_profile_name: '',
        department: '',
        designation: '',
        language: 'ar',
        user_image: '',
        digital_signature: '',
        digital_stamp: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        async function fetchOptions() {
            try {
                const [rolesRes, deptsRes, desigsRes] = await Promise.all([
                    api.getRoleProfiles(),
                    api.getDepartments(),
                    api.getDesignations()
                ]);

                setRoleProfiles(rolesRes.data || []);
                setDepartments(deptsRes.data || []);
                setDesignations(desigsRes.data || []);
            } catch (err) {
                console.error('Failed to fetch options', err);
            } finally {
                setLoadingOptions(false);
            }
        }
        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const generatePassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let newPassword = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            newPassword += charset.charAt(Math.floor(Math.random() * n));
        }
        setFormData(prev => ({ ...prev, password: newPassword }));
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await api.createUser(formData);
            showToast(t('users.success_create'), 'success');
            setFormData(initialFormState);
        } catch (err) {
            console.error('Failed to create user', err);

            let newErrors = {};
            let toastMessage = err.message || t('common.error');

            // Handle Frappe server messages for field-level errors
            const messages = err.serverMessages || [];

            messages.forEach(msgObj => {
                const msg = msgObj.message || '';

                if (msg.includes('Mobile No must be unique') || msg.includes('mobile_no')) {
                    newErrors.mobile_no = msg;
                }
                if (msg.includes('Username') && (msg.includes('already exists') || msg.includes('Duplicate'))) {
                    newErrors.first_name = msg;
                }
                if (msg.includes('Email') && msg.includes('exist')) {
                    newErrors.email = msg;
                }

                // Use the most specific message for the toast
                toastMessage = msg;
            });

            // fallback for exception strings if serverMessages are empty
            if (messages.length === 0 && err.message) {
                const msg = err.message;
                if (msg.includes('mobile_no')) newErrors.mobile_no = msg;
                if (msg.includes('Username')) newErrors.first_name = msg;
                if (msg.includes('Duplicate entry')) {
                    if (msg.includes('mobile_no')) newErrors.mobile_no = msg;
                    else if (msg.includes('email')) newErrors.email = msg;
                }
            }

            setErrors(newErrors);
            showToast(toastMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const parties = ['Contractor', 'Consultant', 'Owner'];
    const userCategories = ['Mechanical', 'Civil', 'Architectural', 'Electrical'];

    // Helper to render input with error
    const renderInput = (name, type = 'text', required = false, labelKey = null) => {
        const key = labelKey || name;
        const isPassword = name === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {t(`users.fields.${key}`)}
                </label>
                <div className="relative">
                    <input
                        type={inputType}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={required}
                        className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all ${isPassword ? 'pr-24' : ''} ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                            }`}
                        placeholder={t(`users.placeholders.${key.replace('_no', '')}`) || ''}
                    />
                    {isPassword && (
                        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 ${isRTL ? 'left-2' : 'right-2'}`}>
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                title={t('users.generate_password')}
                            >
                                <Wand2 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    )}
                </div>
                {errors[name] && (
                    <p className="text-xs text-red-600 font-black flex items-center gap-1 animate-in slide-in-from-top-1 pr-1">
                        <X className="w-3.5 h-3.5" />
                        {errors[name]}
                    </p>
                )}
            </div>
        );
    };

    const renderSelect = (name, options, loading, labelKey = null) => {
        const key = labelKey || name;
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {t(`users.fields.${key}`)}
                </label>
                <div className="relative">
                    <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        disabled={loading}
                        required={true}
                        className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all appearance-none ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                            }`}
                    >
                        <option value="">{t('users.placeholders.select')}</option>
                        {options.map(opt => (
                            <option key={opt.value || opt.name || opt} value={opt.value || opt.name || opt}>
                                {opt.label || opt.name || opt}
                            </option>
                        ))}
                    </select>
                </div>
                {errors[name] && (
                    <p className="text-xs text-red-600 font-black flex items-center gap-1 animate-in slide-in-from-top-1 pr-1">
                        <X className="w-3.5 h-3.5" />
                        {errors[name]}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="relative mb-12">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
                <PageHeader
                    title={t('users.add_user')}
                    subtitle={t('users.form_description')}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                <form onSubmit={handleSubmit} className="premium-card p-8 sm:p-12 space-y-8">
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-8">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{t('users.add_user')}</h3>
                            <p className="text-sm text-slate-500 font-medium">{t('users.form_description')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderInput('first_name', 'text', true)}
                        {renderInput('middle_name', 'text')}
                        {renderInput('last_name', 'text', true)}

                        {renderInput('email', 'email', true)}
                        {renderInput('password', 'password', true)}
                        {renderInput('mobile_no', 'tel', false, 'mobile')}
                        {renderSelect('party', parties, false)}
                        {renderSelect('user_category', userCategories, false)}

                        {renderSelect('role_profile_name', roleProfiles, loadingOptions, 'role_profile')}
                        {renderSelect('department', departments, loadingOptions)}
                        {renderSelect('designation', designations, loadingOptions)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                        <ImageUpload
                            label={t('users.fields.user_image')}
                            value={formData.user_image}
                            onChange={(url) => setFormData(prev => ({ ...prev, user_image: url }))}
                            onRemove={() => setFormData(prev => ({ ...prev, user_image: '' }))}
                        />
                        <ImageUpload
                            label={t('users.fields.digital_signature')}
                            value={formData.digital_signature}
                            onChange={(url) => setFormData(prev => ({ ...prev, digital_signature: url }))}
                            onRemove={() => setFormData(prev => ({ ...prev, digital_signature: '' }))}
                        />
                        <ImageUpload
                            label={t('users.fields.digital_stamp')}
                            value={formData.digital_stamp}
                            onChange={(url) => setFormData(prev => ({ ...prev, digital_stamp: url }))}
                            onRemove={() => setFormData(prev => ({ ...prev, digital_stamp: '' }))}
                        />
                    </div>

                    <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 mt-8">
                        <Link
                            href="/users"
                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
                        >
                            {t('common.cancel')}
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {t('common.confirm')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
