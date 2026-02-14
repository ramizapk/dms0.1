'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import {
    FolderPlus,
    Save,
    X,
    Loader2,
    Calendar,
    MapPin,
    UserCircle,
    Hash,
    Type,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function EditProjectPage() {
    const { t, isRTL } = useI18n();
    const router = useRouter();
    const params = useParams(); // Get the project ID (name)
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Options
    const [projectManagers, setProjectManagers] = useState([]);

    // Form State
    const initialFormState = {
        name: '',
        project_name: '',
        custom_project_code: '',
        custom_project_name_en: '',
        custom_location: '',
        custom_project_manager: '',
        custom_description: '',
        expected_start_date: '',
        expected_end_date: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch project managers
                const managersRes = await api.getProjectManagers();
                if (managersRes.message && managersRes.message.success) {
                    setProjectManagers(managersRes.message.data || []);
                }

                // Fetch project details
                if (params.id) {
                    const projectRes = await api.getProject(decodeURIComponent(params.id));
                    if (projectRes.message && projectRes.message.success) {
                        const data = projectRes.message.data;
                        setFormData({
                            name: data.name,
                            project_name: data.project_name || '',
                            custom_project_code: data.custom_project_code || '',
                            custom_project_name_en: data.custom_project_name_en || '',
                            custom_location: data.custom_location || '',
                            custom_project_manager: data.custom_project_manager || '',
                            custom_description: data.custom_description || '',
                            expected_start_date: data.expected_start_date || '',
                            expected_end_date: data.expected_end_date || ''
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
                showToast(t('common.error'), 'error');
            } finally {
                setLoading(false);
                setLoadingOptions(false);
            }
        }
        fetchData();
    }, [params.id]);

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
            const res = await api.updateProject(formData);
            if (res.message && res.message.success) {
                showToast(t('projects.success_update'), 'success');
                router.push('/projects');
            }
        } catch (err) {
            console.error('Failed to update project', err);
            showToast(err.message || t('common.error'), 'error');

            if (err.serverMessages) {
                // Handle specific server messages if needed
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to render input
    const renderInput = (name, type = 'text', icon = null, required = false) => {
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    {icon && <span className="text-indigo-400">{icon}</span>}
                    {t(`projects.fields.${name}`)}
                </label>
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all
                        ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                        }`}
                    placeholder={t(`projects.placeholders.enter_${name}`) || ''}
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

    const renderSelect = (name, options, loading, icon = null, required = false, placeholderKey) => {
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    {icon && <span className="text-indigo-400">{icon}</span>}
                    {t(`projects.fields.${name}`)}
                </label>
                <div className="relative">
                    <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        disabled={loading}
                        required={required}
                        className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all appearance-none cursor-pointer ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                            }`}
                    >
                        <option value="">{t(`projects.placeholders.${placeholderKey}`) || 'Select...'}</option>
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
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
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            <div className="relative mb-12">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
                <PageHeader
                    title={t('projects.edit_project')}
                    subtitle={t('projects.update_details')}
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
                            <FolderPlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{t('projects.edit_project_details')}</h3>
                            <p className="text-sm text-slate-500 font-medium">{t('projects.fill_details')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderInput('project_name', 'text', <Type className="w-4 h-4" />, true)}
                        {renderInput('custom_project_name_en', 'text', <Type className="w-4 h-4" />, true)}

                        {renderInput('custom_project_code', 'text', <Hash className="w-4 h-4" />, true)}
                        {renderInput('custom_location', 'text', <MapPin className="w-4 h-4" />, true)}

                        <div className="md:col-span-2">
                            {renderSelect('custom_project_manager', projectManagers, loadingOptions, <UserCircle className="w-4 h-4" />, true, 'select_manager')}
                        </div>

                        {renderInput('expected_start_date', 'date', <Calendar className="w-4 h-4" />, true)}
                        {renderInput('expected_end_date', 'date', <Calendar className="w-4 h-4" />, true)}

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-400" />
                                {t('projects.fields.custom_description')}
                            </label>
                            <textarea
                                name="custom_description"
                                value={formData.custom_description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all resize-none"
                                placeholder={t('projects.placeholders.enter_description')}
                            />
                        </div>
                    </div>

                    <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 mt-8">
                        <Link
                            href="/projects"
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
    );
}
