'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/provider';
import PageHeader from '@/components/ui/PageHeader';
import Stepper from '@/components/ui/Stepper';
import FileUpload from '@/components/ui/FileUpload';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, SkipForward } from 'lucide-react';

export default function EditDocumentStep2Page({ params }) {
    const { t, isRTL } = useI18n();
    const { id } = use(params);
    const router = useRouter();
    const [isComplete, setIsComplete] = useState(false);

    const steps = [
        { label: t('documents.steps.step1') || 'Document Details' },
        { label: t('documents.steps.step2') || 'Upload Files' }
    ];

    const handleUploadComplete = () => {
        setIsComplete(true);
    };

    const handleFinish = () => {
        router.push('/documents');
    };

    return (
        <div className="space-y-12 pb-20">
            <div className="relative mb-12">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
                <PageHeader
                    title={`${t('documents.edit_document')} - ${t('documents.steps.step2')}`}
                    subtitle={`Document ${decodeURIComponent(id)}`}
                />
            </div>

            <div className="max-w-4xl mx-auto mb-10">
                <Stepper steps={steps} currentStep={1} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                <div className="premium-card p-8 sm:p-12 space-y-8">
                    {!isComplete ? (
                        <>
                            <div className="text-center space-y-2 mb-8">
                                <h3 className="text-2xl font-black text-slate-900">{t('documents.upload_files')}</h3>
                                <p className="text-slate-500">{t('documents.upload_description')}</p>
                            </div>

                            <FileUpload
                                docName={decodeURIComponent(id)}
                                onAllUploadsComplete={handleUploadComplete}
                                multiple={true}
                            />

                            <div className="flex justify-center pt-8 border-t border-slate-100 mt-8">
                                <button
                                    onClick={handleFinish}
                                    className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-2 transition-colors"
                                >
                                    {t('common.skip_finish') || 'Skip & Finish'}
                                    <SkipForward className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 space-y-6"
                        >
                            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-xl shadow-green-500/20">
                                <CheckCircle className="h-12 w-12" />
                            </div>

                            <div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">{t('documents.success_complete')}</h2>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    {t('documents.success_message')}
                                </p>
                            </div>

                            <button
                                onClick={handleFinish}
                                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                {t('documents.back_to_list')}
                                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
