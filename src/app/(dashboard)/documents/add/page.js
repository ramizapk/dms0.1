'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import {
    FilePlus,
    Save,
    X,
    Loader2,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import Stepper from '@/components/ui/Stepper';

export default function AddDocumentPage() {
    const { t, isRTL } = useI18n();
    const router = useRouter();
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);

    const steps = [
        { label: t('documents.steps.step1') || 'Document Details' },
        { label: t('documents.steps.step2') || 'Upload Files' }
    ];
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Dynamic Options
    const [projects, setProjects] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);

    // Static Options
    const submittalTypes = ['New', 'Re-Submittal'];
    const [disciplines, setDisciplines] = useState([]);

    // Form State
    const initialFormState = {
        project_name: '',
        custom_consultant: '',
        custom_owner: '',
        custom_contractor: '',
        submittal_type: 'New',
        discipline: '',
        document_type: '',
        building_name: '',
        floor: '',
        room: '',
        description: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        async function fetchOptions() {
            try {
                const [projectsRes, docTypesRes] = await Promise.all([
                    api.getProjects(),
                    api.getDocumentTypes()
                ]);

                setProjects(projectsRes.data || []);
                setDocumentTypes(docTypesRes.data || []);
            } catch (err) {
                console.error('Failed to fetch options', err);
                showToast(t('common.error'), 'error');
            } finally {
                setLoadingOptions(false);
            }
        }
        fetchOptions();
    }, []);

    // Handle Project Selection to fetch parties
    useEffect(() => {
        async function fetchParties() {
            if (!formData.project_name) {
                setFormData(prev => ({
                    ...prev,
                    custom_consultant: '',
                    custom_owner: '',
                    custom_contractor: ''
                }));
                return;
            }

            try {
                const res = await api.getProjectParties(formData.project_name);
                if (res.message && res.message.success) {
                    const {
                        custom_consultant,
                        custom_owner,
                        custom_contractor,
                        custom_room,
                        custom_building,
                        custom_floor,
                        discipline_options_for_user
                    } = res.message.data;

                    setFormData(prev => ({
                        ...prev,
                        custom_consultant: custom_consultant || '',
                        custom_owner: custom_owner || '',
                        custom_contractor: custom_contractor || '',
                        building_name: custom_building || '',
                        floor: custom_floor || '',
                        room: custom_room || ''
                    }));

                    if (discipline_options_for_user && Array.isArray(discipline_options_for_user)) {
                        setDisciplines(discipline_options_for_user);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch project parties', err);
            }
        }

        fetchParties();
    }, [formData.project_name]);

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
            const res = await api.createDocument(formData);
            if (res.message && res.message.success) {
                showToast(t('documents.success_create'), 'success');
                // Redirect to Step 2 with the new document name (ID)
                const docName = res.message.data.name;
                router.push(`/documents/${docName}/step-2`);
            }
        } catch (err) {
            console.error('Failed to create document', err);
            showToast(err.message || t('common.error'), 'error');

            // Handle server validation errors if any
            if (err.serverMessages) {
                // Basic mapping, can be improved based on actual error structure
                const newErrors = {};
                // logic to map server messages to fields...
                setErrors(newErrors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to render input
    const renderInput = (name, type = 'text', required = false, readOnly = false) => {
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {t(`documents.fields.${name}`)}
                </label>
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    readOnly={readOnly}
                    className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all ${readOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                        } ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                        }`}
                    placeholder={!readOnly ? t(`documents.placeholders.enter_${name}`) || '' : ''}
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

    const renderSelect = (name, options, loading, required = false, placeholderKey) => {
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {t(`documents.fields.${name}`)}
                </label>
                <div className="relative">
                    <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        disabled={loading}
                        required={required}
                        className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all appearance-none ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                            }`}
                    >
                        <option value="">{t(`documents.placeholders.${placeholderKey}`)}</option>
                        {options.map(opt => {
                            const isObject = typeof opt === 'object' && opt !== null;
                            const value = isObject ? opt.name : opt;
                            let label = value;

                            // Enhanced display for projects: "ID - Project Name"
                            if (isObject && opt.project_name) {
                                label = `${opt.name} - ${opt.project_name}`;
                            } else if (isObject && opt.label) {
                                label = opt.label;
                            }

                            return (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            );
                        })}
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
                    title={t('documents.add_document')}
                    subtitle={t('documents.form_description')}
                />
            </div>

            <div className="max-w-4xl mx-auto mb-10">
                <Stepper steps={steps} currentStep={0} />
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
                            <FilePlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{t('documents.new_document')}</h3>
                            <p className="text-sm text-slate-500 font-medium">{t('documents.form_description')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderSelect('project_name', projects, loadingOptions, true, 'select_project')}

                        {/* Auto-filled Parties */}
                        {renderInput('custom_consultant', 'text', false, true)}
                        {renderInput('custom_owner', 'text', false, true)}
                        {renderInput('custom_contractor', 'text', false, true)}

                        {/* Submittal Type is hidden & fixed to New */}
                        {renderSelect('discipline', disciplines, false, true, 'select_discipline')}

                        <div className="md:col-span-2">
                            {renderSelect('document_type', documentTypes, loadingOptions, true, 'select_doc_type')}
                        </div>

                        {/* Location Details */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {renderInput('building_name', 'text', false, true)}
                            {renderInput('floor', 'text', false, true)}
                            {renderInput('room', 'text', false, true)}
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {t('documents.fields.description')}
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                validation="required"
                                rows={4}
                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all resize-none"
                                placeholder={t('documents.placeholders.enter_description')}
                            />
                        </div>
                    </div>

                    <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 mt-8">
                        <Link
                            href="/documents"
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
