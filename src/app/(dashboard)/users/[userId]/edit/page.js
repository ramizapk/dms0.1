'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import {
    UserCog,
    Save,
    X,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import ImageUpload from '@/components/ui/ImageUpload';

export default function EditUserPage({ params }) {
    // Unwrap params using React.use()
    const { userId } = use(params);
    const decodedUserId = decodeURIComponent(userId);

    const { t, isRTL } = useI18n();
    const router = useRouter();
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingOptions, setLoadingOptions] = useState(true);

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
        async function fetchData() {
            try {
                setLoading(true);
                const [userRes, rolesRes, deptsRes, desigsRes] = await Promise.all([
                    api.getUser(decodedUserId),
                    api.getRoleProfiles(),
                    api.getDepartments(),
                    api.getDesignations()
                ]);

                if (userRes.data) {
                    const userData = userRes.data;
                    setFormData({
                        first_name: userData.first_name || '',
                        middle_name: userData.middle_name || '',
                        last_name: userData.last_name || '',
                        email: userData.email || '',
                        mobile_no: userData.mobile_no || '',
                        party: userData.party || '',
                        user_category: userData.user_category || '',
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
                console.error('Failed to fetch data', err);
                showToast(t('common.error'), 'error');
                router.push('/users');
            } finally {
                setLoading(false);
                setLoadingOptions(false);
            }
        }
        fetchData();
    }, [decodedUserId, router, showToast, t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await api.updateUser(decodedUserId, formData);
            showToast(t('settings.saved'), 'success'); // Reusing success message
        } catch (err) {
            console.error('Failed to update user', err);

            let newErrors = {};
            let toastMessage = err.message || t('common.error');

            // Handle Frappe server messages for field-level errors
            const messages = err.serverMessages || [];

            // ... (Error handling logic same as Add User) ...
            if (messages.length > 0) {
                toastMessage = messages[0].message || toastMessage;
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
    const renderInput = (name, type = 'text', required = false, labelKey = null, disabled = false) => {
        const key = labelKey || name;
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {t(`users.fields.${key}`)}
                </label>
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all 
                        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                        ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                        }`}
                    placeholder={t(`users.placeholders.${key.replace('_no', '')}`) || ''}
                />
                {errors[name] && (
                    <p className="text-xs text-red-600 font-black flex items-center gap-1 animate-in slide-in-from-top-1 pr-1">
                        <X className="w-3.5 h-3.5" />
                        {errors[name]}
                    </p>
                )}
            </div>
        );
    };

    const renderSelect = (name, options, loading, labelKey = null, disabled = false) => {
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
                        disabled={loading || disabled}
                        required={true}
                        className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all appearance-none 
                            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                            ${errors[name]
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="relative mb-12">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
                <PageHeader
                    title={t('users.edit_title') || "Edit User"} // Fallback title
                    subtitle={t('users.edit_description') || "Update user details"} // Fallback subtitle
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
                            <UserCog className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{t('users.edit_title') || "Edit User"}</h3>
                            <p className="text-sm text-slate-500 font-medium">{t('users.edit_description') || "Update user details"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderInput('first_name', 'text', true)}
                        {renderInput('middle_name', 'text')}
                        {renderInput('last_name', 'text', true)}

                        {renderInput('email', 'email', true, null, true)} {/* Read Only */}
                        {renderInput('mobile_no', 'tel', false, 'mobile')}
                        {renderSelect('party', parties, false, null, true)} {/* Read Only */}
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
