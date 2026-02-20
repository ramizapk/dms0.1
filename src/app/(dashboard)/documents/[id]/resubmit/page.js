'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import {
    FilePlus,
    Save,
    X,
    Loader2,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import Stepper from '@/components/ui/Stepper';

export default function ReSubmitPage() {
    const { t, isRTL } = useI18n();
    const router = useRouter();
    const params = useParams();
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const steps = [
        { label: t('documents.steps.step1') || 'Document Details' },
        { label: t('documents.steps.step2') || 'Upload Files' }
    ];

    // Form State
    const [formData, setFormData] = useState({
        project_name: '',
        custom_consultant: '',
        custom_owner: '',
        custom_contractor: '',
        submittal_type: 'Re-Submittal', // Fixed
        discipline: '',
        document_type: '',
        building_name: '',
        floor: '',
        room: '',
        description: '',
        previous_submittal_no: ''
    });

    const [errors, setErrors] = useState({});

    // Fetch original document data
    useEffect(() => {
        async function fetchDocument() {
            try {
                const res = await api.getDocument(decodeURIComponent(params.id));
                if (res.message && res.message.success) {
                    const doc = res.message.data;

                    setFormData(prev => ({
                        ...prev,
                        project_name: doc.project_name || '',
                        custom_consultant: doc.custom_consultant || '',
                        custom_owner: doc.custom_owner || '',
                        custom_contractor: doc.custom_contractor || '',
                        discipline: doc.discipline || '',
                        document_type: doc.document_type || '',
                        building_name: doc.building_name || '',
                        floor: doc.floor || '',
                        room: doc.room || '',
                        description: doc.description || '', // Editable
                        previous_submittal_no: doc.name // The ID of the doc being resubmitted
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch document', err);
                showToast(t('common.error_fetch_doc') || 'Failed to fetch document details', 'error');
                router.push('/documents');
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            fetchDocument();
        }
    }, [params.id]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        // Only description is editable
        if (name === 'description') {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: null }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            // Prepare payload - only send required fields for Re-Submit
            const payload = {
                previous_submittal_no: formData.previous_submittal_no,
                submittal_type: 'Re-Submittal',
                description: formData.description
            };

            const res = await api.createDocument(payload);

            if (res.message && res.message.success) {
                showToast(t('documents.success_resubmit') || 'Re-submitted successfully', 'success');
                // Redirect to Step 2 with the NEW document name (ID)
                const newDocName = res.message.data.name;
                router.push(`/documents/${newDocName}/step-2`);
            }
        } catch (err) {
            console.error('Failed to re-submit document', err);
            showToast(err.message || t('common.error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to render input - modified to force readOnly except description
    const renderInput = (name, labelOverride = null, isTextArea = false) => {
        const isEditable = name === 'description';

        return (
            <div className={`space-y-2 ${isTextArea ? 'md:col-span-2' : ''}`}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {labelOverride || t(`documents.fields.${name}`)}
                </label>
                {isTextArea ? (
                    <textarea
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        readOnly={!isEditable}
                        rows={4}
                        className={`w-full rounded-xl border-slate-200 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all resize-none 
                            ${!isEditable ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50/50 focus:border-indigo-500 focus:ring-indigo-500/10'}`}
                    />
                ) : (
                    <input
                        type="text"
                        name={name}
                        value={formData[name]}
                        readOnly={true}
                        className="w-full rounded-xl border-slate-200 bg-slate-100 p-3 text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
                    />
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="relative mb-12">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-amber-50/40 to-transparent pointer-events-none" />
                <PageHeader
                    title={t('documents.resubmit_title') || 'Re-Submit Document'}
                    subtitle={`${t('documents.resubmitting') || 'Re-submitting'}: ${formData.previous_submittal_no}`}
                    actions={
                        <Link
                            href="/documents"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 border border-slate-200 transition-all"
                        >
                            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                            {t('common.back')}
                        </Link>
                    }
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
                <form onSubmit={handleSubmit} className="premium-card p-8 sm:p-12 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <FilePlus className="h-64 w-64 text-slate-900" />
                    </div>

                    <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-8 relative z-10">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                            <FilePlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{t('documents.resubmit_details') || 'Re-Submittal Details'}</h3>
                            <p className="text-sm text-slate-500 font-medium">{t('documents.resubmit_desc') || 'Review details and update description'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {renderInput('project_name')}

                        {renderInput('custom_consultant')}
                        {renderInput('custom_owner')}
                        {renderInput('custom_contractor')}

                        {renderInput('submittal_type')}
                        {renderInput('discipline')}

                        <div className="md:col-span-2">
                            {renderInput('document_type')}
                        </div>

                        {/* Location Details */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {renderInput('building_name')}
                            {renderInput('floor')}
                            {renderInput('room')}
                        </div>

                        {/* Description - Editable */}
                        <div className="md:col-span-2">
                            <RichTextEditor
                                value={formData.description}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, description: val }));
                                    if (errors.description) {
                                        setErrors(prev => ({ ...prev, description: null }));
                                    }
                                }}
                                label={t('documents.fields.description')}
                                placeholder={t('documents.placeholders.enter_description')}
                                error={errors.description}
                            />
                        </div>
                    </div>

                    <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 mt-8 relative z-10">
                        <Link
                            href="/documents"
                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
                        >
                            {t('common.cancel')}
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-600 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('common.processing') || 'Processing...'}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {t('documents.resubmit_confirm') || 'Re-Submit Document'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
