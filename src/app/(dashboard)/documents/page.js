'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import { STATS_CARDS, STATUS_COLORS } from '@/lib/constants';
import StatsCard from '@/components/ui/StatsCard';
import MiniStatBadge from '@/components/ui/MiniStatBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import {
    Search, Filter, ChevronLeft, ChevronRight,
    FileText, Download, MoreVertical, SlidersHorizontal
} from 'lucide-react';

export default function DocumentsPage() {
    const { t, isRTL } = useI18n();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        discipline: '',
        search: '',
    });
    const [start, setStart] = useState(0);
    const [page, setPage] = useState(1);
    const pageLength = 20;

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await api.getDashboardData({
                    start: (page - 1) * pageLength,
                    page_length: pageLength,
                    filters: {
                        status: filters.status || undefined,
                        discipline: filters.discipline || undefined,
                        search: filters.search || undefined
                    }
                });
                setData(response.message);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [page, filters]);

    if (loading && !data) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton rounded-xl" />)}
                </div>
                <LoadingSkeleton type="table" rows={10} />
            </div>
        );
    }

    const statsMain = [
        { ...STATS_CARDS[0], value: data?.stats?.main?.total || 0, label: t('dashboard.total') },
        { ...STATS_CARDS[1], value: data?.stats?.main?.pending || 0, label: t('dashboard.pending') },
        { ...STATS_CARDS[2], value: data?.stats?.main?.review || 0, label: t('dashboard.review') },
        { ...STATS_CARDS[3], value: data?.stats?.main?.approved || 0, label: t('dashboard.approved') },
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                title={t('documents.title')}
                subtitle={t('documents.subtitle')}
            />

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsMain.map((stat, i) => {
                    const { key, ...rest } = stat;
                    return <StatsCard key={key} {...rest} index={i} />;
                })}
            </div>

            {/* Mini Stats Row */}
            {data?.stats?.by_type && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {data.stats.by_type.map((item, idx) => (
                        <MiniStatBadge key={`${item.abbr}-${idx}`} abbr={item.abbr} count={item.count} />
                    ))}
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-slate-900 shadow-xl rounded-2xl border border-white/5 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder={t('documents.search_placeholder')}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 h-11 bg-slate-800/50 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 ring-offset-slate-900"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full pl-10 h-11 bg-slate-800/50 border border-white/10 rounded-xl text-sm appearance-none"
                        >
                            <option value="">{t('documents.all_statuses')}</option>
                            {Object.keys(STATUS_COLORS).map((s) => (
                                <option key={s} value={s}>{t(`status.${s}`)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <select
                            value={filters.discipline}
                            onChange={(e) => setFilters({ ...filters, discipline: e.target.value })}
                            className="w-full pl-10 h-11 bg-slate-800/50 border border-white/10 rounded-xl text-sm appearance-none"
                        >
                            <option value="">{t('documents.all_disciplines')}</option>
                            {data?.meta?.disciplines?.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents Table */}
            <div className="bg-slate-900 shadow-2xl rounded-2xl border border-white/5 overflow-hidden">
                {data?.docs?.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right rtl:text-right ltr:text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('documents.name')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('documents.title_head')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('documents.discipline')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('documents.status')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {data.docs.map((doc, idx) => (
                                        <motion.tr
                                            key={doc.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-white">{doc.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-400 max-w-xs truncate">
                                                    {doc.custom_document_title || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-medium text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
                                                    {doc.discipline || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={doc.status_category} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-white/5 bg-slate-900/50 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {t('common.showing')} {data.start + 1}-{data.start + data.docs.length}
                            </span>
                            <div className="flex items-center gap-4">
                                <button
                                    disabled={!data.has_previous}
                                    onClick={() => setPage(page - 1)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                    {t('common.previous')}
                                </button>
                                <div className="flex items-center gap-1">
                                    <span className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/20">{page}</span>
                                </div>
                                <button
                                    disabled={!data.has_next}
                                    onClick={() => setPage(page + 1)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    {t('common.next')}
                                    <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-24">
                        <EmptyState title={t('documents.no_documents')} icon={FileText} />
                    </div>
                )}
            </div>
        </div>
    );
}
