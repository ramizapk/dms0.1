'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/ui/StatsCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
    Archive,
    FileText,
    Calendar,
    CheckCircle2,
    Filter,
    Search
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

const ARCHIVE_STATS = [
    {
        key: 'total_approved',
        icon: CheckCircle2,
        gradient: 'from-emerald-500 to-teal-500',
        shadowColor: 'shadow-emerald-500/25',
    },
    {
        key: 'approved_this_month',
        icon: Calendar,
        gradient: 'from-blue-500 to-indigo-500',
        shadowColor: 'shadow-blue-500/25',
    },
    {
        key: 'filtered_total',
        icon: Filter,
        gradient: 'from-violet-500 to-purple-500',
        shadowColor: 'shadow-violet-500/25',
    }
];

export default function ArchivePage() {
    const { t, isRTL } = useI18n();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await api.getArchiveFull();
                setData(response.message);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-12">
                <div className="h-12 w-80 skeleton" />
                <LoadingSkeleton type="cards" />
                <div className="h-96 skeleton" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white rounded-2xl border border-rose-100 shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                    <Archive className="h-8 w-8 text-rose-500" />
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-slate-900 mb-2">{t('common.error')}</p>
                    <p className="text-slate-500 max-w-sm">{error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-2xl bg-indigo-600 px-10 py-4 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                >
                    {t('common.retry')}
                </button>
            </div>
        );
    }

    const stats = data?.stats || {};
    const statsData = [
        { ...ARCHIVE_STATS[0], value: stats.total_approved, label: t('archive.total_approved') },
        { ...ARCHIVE_STATS[1], value: stats.approved_this_month, label: t('archive.approved_this_month') },
        { ...ARCHIVE_STATS[2], value: stats.filtered_total, label: t('archive.filtered_total') },
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="relative mb-12">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
                <PageHeader
                    title={t('archive.title')}
                    subtitle={t('archive.subtitle')}
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {statsData.map((stat, index) => (
                    <StatsCard
                        key={stat.key}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        gradient={stat.gradient}
                        shadowColor={stat.shadowColor}
                        index={index}
                    />
                ))}
            </div>

            {/* Documents List */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="premium-card flex flex-col"
            >
                <div className="px-10 py-10 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xl shadow-indigo-500/5 group">
                            <Archive className="h-7 w-7 text-indigo-600 transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{t('archive.title')}</h2>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">
                                {data?.docs?.length || 0} {t('documents.total_records')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    {data?.docs?.length > 0 ? (
                        <div className="luxury-table-container">
                            <table className="luxury-table">
                                <thead>
                                    <tr>
                                        <th>{t('documents.name')}</th>
                                        <th>{t('documents.document_type')}</th>
                                        <th>{t('documents.discipline')}</th>
                                        <th>{t('documents.workflow_state')}</th>
                                        <th>{t('documents.creation_date')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.docs.map((doc, i) => (
                                        <motion.tr
                                            key={doc.name}
                                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.05 }}
                                            className="group"
                                        >
                                            <td>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{doc.name}</span>
                                                    {doc.project_no && (
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{doc.project_no}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-slate-700">{isRTL ? doc.document_type_ar : doc.document_type}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{doc.submittal_type}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                                                    {doc.discipline}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-bold text-slate-500 italic">
                                                        {doc.workflow_state}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">
                                                        {new Date(doc.creation).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400">
                                                        {new Date(doc.creation).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-24">
                            <EmptyState title={t('archive.no_documents')} icon={Archive} />
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
