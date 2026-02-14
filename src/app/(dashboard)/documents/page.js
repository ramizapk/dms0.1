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
    FileText, Download, MoreVertical, SlidersHorizontal, Plus, Edit, Eye, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function DocumentsPage() {
    const { t, isRTL } = useI18n();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        document_type: '',
        discipline: '',
        status: '',
        action: '',
        action: '',
        approval: '',
        date_from: '',
        date_to: '',
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

                // Construct flat parameters object
                const params = {
                    start: startParams,
                    page_length: pageLength,
                    fetch_meta: 1,
                };

                // Add defined filters
                if (filters.search) params.search = filters.search;
                if (filters.document_type) params.document_type = filters.document_type;
                if (filters.discipline) params.discipline = filters.discipline;
                if (filters.status) params.status = filters.status;
                if (filters.action) params.action = filters.action;
                if (filters.approval) params.approval = filters.approval;
                if (filters.date_from) params.date_from = filters.date_from;
                if (filters.date_to) params.date_to = filters.date_to;

                const response = await api.getDashboardData(params);
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
                            <MiniStatBadge
                                key={`${item.abbr}-${idx}`}
                                abbr={item.abbr}
                                count={item.count}
                                isActive={filters.document_type === item.name}
                                onClick={() => {
                                    setFilters({ ...filters, document_type: filters.document_type === item.name ? '' : item.name });
                                    setPage(1);
                                }}
                            />
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

                {/* Advanced Filters Row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mt-4 pt-4 border-t border-slate-100">
                    {/* Status Filter */}
                    <div className="relative">
                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={filters.status}
                            onChange={(e) => {
                                setFilters({ ...filters, status: e.target.value });
                                setPage(1);
                            }}
                            className="w-full pl-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">{t('documents.all_statuses')}</option>
                            <option value="Draft">{t('documents.status_draft')}</option>
                            <option value="Open">{t('documents.status_open')}</option>
                            <option value="Close">{t('documents.status_close')}</option>
                        </select>
                    </div>

                    {/* Action Filter */}
                    <div className="relative">
                        <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={filters.action}
                            onChange={(e) => {
                                setFilters({ ...filters, action: e.target.value });
                                setPage(1);
                            }}
                            className="w-full pl-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">{t('documents.all_actions')}</option>
                            <option value="Accepted">{t('documents.action_accepted')}</option>
                            <option value="Rejected">{t('documents.action_rejected')}</option>
                            <option value="No Action">{t('documents.action_no_action')}</option>
                        </select>
                    </div>

                    {/* Approval Filter */}
                    <div className="relative">
                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={filters.approval}
                            onChange={(e) => {
                                setFilters({ ...filters, approval: e.target.value });
                                setPage(1);
                            }}
                            className="w-full pl-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">{t('documents.all_approvals')}</option>
                            <option value="0">0</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="E">E</option>
                        </select>
                    </div>

                    {/* Date From Filter */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('documents.filter_date_from')}
                            value={filters.date_from}
                            onFocus={(e) => (e.target.type = 'date')}
                            onBlur={(e) => {
                                if (!e.target.value) e.target.type = 'text';
                            }}
                            onChange={(e) => {
                                setFilters({ ...filters, date_from: e.target.value });
                                setPage(1);
                            }}
                            className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    {/* Date To Filter */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('documents.filter_date_to')}
                            value={filters.date_to}
                            onFocus={(e) => (e.target.type = 'date')}
                            onBlur={(e) => {
                                if (!e.target.value) e.target.type = 'text';
                            }}
                            onChange={(e) => {
                                setFilters({ ...filters, date_to: e.target.value });
                                setPage(1);
                            }}
                            className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
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
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const isEditable = user?.userId === doc.owner && doc.workflow_state === 'Draft – Contractor Specialist Engineer';
                                                        return isEditable ? (
                                                            <Link
                                                                href={`/documents/${doc.name}/edit`}
                                                                className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all"
                                                                title={t('common.edit')}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        ) : (
                                                            <div
                                                                className="h-8 w-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center cursor-not-allowed"
                                                                title={t('documents.cannot_edit')}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </div>
                                                        );
                                                    })()}
                                                    <Link
                                                        href={`/documents/${doc.name}`}
                                                        className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                                                        title={t('common.view')}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
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
