'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import {
    Briefcase,
    Save,
    X,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToast } from '@/context/ToastContext';
import PermissionGate from '@/components/auth/PermissionGate';
import WorkspaceGuard from '@/components/auth/WorkspaceGuard';

export default function AddProjectPartyPage() {
    const { t, isRTL } = useI18n();
    const router = useRouter();
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const initialFormState = {
        party_name_arabic: '',
        party_name_english: '',
        party_type: '',
        company_logo: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await api.createProjectPartyProfile(formData);
            showToast(t('project_parties.success_create'), 'success');
            router.push('/project-parties');
        } catch (err) {
            console.error('Failed to create project party', err);
            showToast(err.message || t('common.error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const partyTypes = ['Contractor', 'Consultant', 'Owner'];

    const renderInput = (name, type = 'text', required = false) => {
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {t(`project_parties.fields.${name}`)} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={required}
                        className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                            }`}
                        placeholder={t(`project_parties.placeholders.${name}`) || ''}
                    />
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

    const renderSelect = (name, options, required = false) => {
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {t(`project_parties.fields.${name}`)} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={required}
                        className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all appearance-none ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                            }`}
                    >
                        <option value="">{t('common.select')}</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>
                                {opt}
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
        <WorkspaceGuard workspace="ملفات-الأطراف">
            <PermissionGate
                resource="Project Party Profile"
                action="create"
                fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                        <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            You do not have permission to create a project party. Please contact your administrator.
                        </p>
                        <Link
                            href="/project-parties"
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Back to List
                        </Link>
                    </div>
                }
            >
                <div className="space-y-12 pb-20">
                    {/* Header */}
                    <div className="relative mb-12">
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
                        <PageHeader
                            title={t('project_parties.add_party')}
                            subtitle={t('project_parties.form_description')}
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
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{t('project_parties.add_party')}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{t('project_parties.form_description')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderInput('party_name_arabic', 'text', true)}
                                {renderInput('party_name_english', 'text', true)}
                                {renderSelect('party_type', partyTypes, true)}
                            </div>

                            <div className="grid grid-cols-1 gap-6 pt-6 border-t border-slate-100">
                                <ImageUpload
                                    label={t('project_parties.fields.company_logo')}
                                    value={formData.company_logo}
                                    onChange={(url) => setFormData(prev => ({ ...prev, company_logo: url }))}
                                    onRemove={() => setFormData(prev => ({ ...prev, company_logo: '' }))}
                                />
                            </div>

                            <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 mt-8">
                                <Link
                                    href="/project-parties"
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
                                            {t('common.saving')}
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
            </PermissionGate>
        </WorkspaceGuard>
    );
}
