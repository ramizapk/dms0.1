'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import { STATS_CARDS } from '@/lib/constants';
import StatsCard from '@/components/ui/StatsCard';
import MiniStatBadge from '@/components/ui/MiniStatBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import {
    Search, Filter, ChevronLeft, ChevronRight,
    FileText, Download, MoreVertical, SlidersHorizontal, Plus
} from 'lucide-react';
import Link from 'next/link';

export default function DocumentsPage() {
    const { t, isRTL } = useI18n();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        document_type: '',
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
                // API expects 'start' (0-based index)
                const startParams = (page - 1) * pageLength;

                // Construct filters array: [['field', 'op', 'value'], ...]
                const activeFilters = [];
                if (filters.search) {
                    activeFilters.push(['name', 'like', `%${filters.search}%`]);
                }
                if (filters.document_type) {
                    activeFilters.push(['document_type', '=', filters.document_type]);
                }
                if (filters.discipline) {
                    activeFilters.push(['discipline', '=', filters.discipline]);
                }

                const response = await api.getDashboardData({
                    start: startParams,
                    page_length: pageLength,
                    filters: activeFilters
                });
                // Response structure: { message: { docs, pagination, stats, meta } }
                setData(response.message);
            } catch (err) {
                console.error("Error fetching data:", err);
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

    const docList = data?.docs || [];
    const pagination = data?.pagination || {};

    const statsMain = [
        { ...STATS_CARDS[0], value: data?.stats?.main?.total || 0, label: t('dashboard.total') },
        { ...STATS_CARDS[1], value: data?.stats?.main?.pending || 0, label: t('dashboard.pending') },
        { ...STATS_CARDS[2], value: data?.stats?.main?.review || 0, label: t('dashboard.review') },
        { ...STATS_CARDS[3], value: data?.stats?.main?.approved || 0, label: t('dashboard.approved') },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <PageHeader
                    title={t('documents.title')}
                    subtitle={t('documents.subtitle')}
                />
                <Link
                    href="/documents/add"
                    className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    {t('documents.add_document')}
                </Link>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsMain.map((stat, i) => {
                    const { key, ...rest } = stat;
                    return <StatsCard key={key} {...rest} index={i} />;
                })}
            </div>

            {/* Mini Stats Row */}
            {
                data?.stats?.by_type && (
                    <div className="flex items-center justify-center gap-3 overflow-x-auto flex-wrap pb-2 scrollbar-hide">
                        {data.stats.by_type.map((item, idx) => (
                            <MiniStatBadge key={`${item.abbr}-${idx}`} abbr={item.abbr} count={item.count} />
                        ))}
                    </div>
                )
            }

            {/* Filters Bar */}
            <div className="bg-white shadow-sm rounded-2xl border border-slate-200 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('documents.search_placeholder')}
                            value={filters.search}
                            onChange={(e) => {
                                setFilters({ ...filters, search: e.target.value });
                                setPage(1); // Reset to first page on search
                            }}
                            className="w-full pl-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={filters.document_type}
                            onChange={(e) => {
                                setFilters({ ...filters, document_type: e.target.value });
                                setPage(1); // Reset to first page on filter change
                            }}
                            className="w-full pl-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">{t('documents.all_types')}</option>
                            {data?.meta?.doc_types?.map((dt) => (
                                <option key={dt.name} value={dt.name}>{dt.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={filters.discipline}
                            onChange={(e) => {
                                setFilters({ ...filters, discipline: e.target.value });
                                setPage(1); // Reset to first page on filter change
                            }}
                            className="w-full pl-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
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
            <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
                {docList.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right rtl:text-right ltr:text-left whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/50">
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('documents.id')}</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('documents.type')}</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('documents.discipline')}</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('documents.status')}</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('documents.stage')}</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('documents.date')}</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {docList.map((doc, idx) => (
                                        <motion.tr
                                            key={doc.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-slate-50/80 transition-colors group"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 max-w-[180px]">
                                                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0">
                                                        <FileText className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900 truncate" title={doc.name}>{doc.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-bold text-slate-600 truncate max-w-[120px] block" title={doc.document_type}>
                                                    {doc.document_type || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[100px] block text-center" title={doc.discipline}>
                                                    {doc.discipline || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={doc.status_category} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-bold text-slate-500 truncate max-w-[150px] block" title={doc.workflow_state}>
                                                    {doc.workflow_state || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-bold text-slate-500 dir-ltr text-right">
                                                    {doc.creation ? doc.creation.split(' ')[0] : '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                                                        <Download className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {t('common.showing')} {pagination.total_records > 0 ? ((page - 1) * pageLength) + 1 : 0}-{Math.min(page * pageLength, pagination.total_records || 0)} {t('common.of')} {pagination.total_records || 0}
                            </span>
                            <div className="flex items-center gap-4">
                                <button
                                    disabled={!pagination.has_previous}
                                    onClick={() => setPage(page - 1)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                                >
                                    <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                    {t('common.previous')}
                                </button>
                                <div className="flex items-center gap-1">
                                    <span className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/30">{page}</span>
                                </div>
                                <button
                                    disabled={!pagination.has_next}
                                    onClick={() => setPage(page + 1)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
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
        </div >
    );
}
