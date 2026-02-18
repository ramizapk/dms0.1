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
    FileText, Download, MoreVertical, SlidersHorizontal, Plus, Edit, Eye, CheckCircle, XCircle, AlertCircle,
    CheckCircle2, Send, Inbox, FileCheck, RefreshCw, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';

export default function DocumentsPage() {
    const { t, isRTL } = useI18n();
    const { user } = useAuth();
    const { showToast } = useToast();
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
    const [resubmitting, setResubmitting] = useState(null); // Track which doc is being resubmitted
    const pageLength = 20;

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

    useEffect(() => {
        fetchData();
    }, [page, filters]);

    const handleReSubmit = async (doc) => {
        if (!doc) return;

        // Confirmation could be added here if needed

        setResubmitting(doc.name);
        try {
            await api.createDocument({
                previous_submittal_no: doc.name,
                submittal_type: 'Re-Submittal'
            });
            showToast(t('documents.resubmitted_success') || 'Resubmitted successfully', 'success');
            // Refresh list
            fetchData();
        } catch (err) {
            console.error('Resubmit failed', err);
            showToast(err.message || t('common.error'), 'error');
        } finally {
            setResubmitting(null);
        }
    };

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

            {/* Quick Stats Grid - Fixed Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        key: 'closed',
                        label: t('dashboard.stat_closed'),
                        value: data?.fixed_cards?.closed || 0,
                        icon: CheckCircle2,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50',
                        border: 'border-emerald-100'
                    },
                    {
                        key: 'initiated',
                        label: t('dashboard.stat_initiated'),
                        value: data?.fixed_cards?.initiated || 0,
                        icon: Send,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50',
                        border: 'border-blue-100'
                    },
                    {
                        key: 'my_submittals',
                        label: t('dashboard.stat_my_submittals'),
                        value: data?.fixed_cards?.my_submittals || 0,
                        icon: FileCheck,
                        color: 'text-violet-600',
                        bg: 'bg-violet-50',
                        border: 'border-violet-100'
                    },
                    {
                        key: 'received',
                        label: t('dashboard.stat_received'),
                        value: data?.fixed_cards?.received || 0,
                        icon: Inbox,
                        color: 'text-amber-600',
                        bg: 'bg-amber-50',
                        border: 'border-amber-100'
                    },
                ].map((stat) => (
                    <div key={stat.key} className={`flex items-center justify-between p-4 rounded-2xl border ${stat.border} bg-white shadow-sm hover:shadow-md transition-all group cursor-default`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors">{stat.label}</span>
                        </div>
                        <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
                    </div>
                ))}
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
                        {/* Desktop Table View */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-right rtl:text-right ltr:text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/50">
                                        <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-12">{t('documents.id') || 'ID'}</th>
                                        <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider ltr:text-left rtl:text-right min-w-[240px]">{t('documents.order') || 'Order'}</th>
                                        <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider ltr:text-left rtl:text-right min-w-[200px]">{t('documents.creator') || 'Creator'}</th>
                                        <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider ltr:text-left rtl:text-right min-w-[200px]">{t('documents.assigned') || 'Assigned'}</th>
                                        <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider ltr:text-left rtl:text-right min-w-[140px]">{t('documents.project') || 'Project'}</th>
                                        <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{t('documents.submitted') || 'Submitted'}</th>
                                        <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{t('documents.action') || 'Action'}</th>
                                        <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{t('documents.actions') || 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {docList.map((doc, idx) => (
                                        <motion.tr
                                            key={doc.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            {/* ID */}
                                            <td className="px-2 py-6 text-center align-top">
                                                <span className="text-xs font-bold text-slate-500">
                                                    {((page - 1) * pageLength) + idx + 1}
                                                </span>
                                            </td>

                                            {/* ORDER (Complex Cell) */}
                                            <td className="px-2 py-4 align-top">
                                                <div className="flex flex-col gap-2">
                                                    <div className="font-bold text-slate-900 text-sm tracking-tight break-words">{doc.name}</div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap ${doc.submittal_type === 'Re-Submittal' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                            {doc.submittal_type || doc.discipline}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                                            {doc.creation ? new Date(doc.creation).toLocaleString() : '-'}
                                                        </span>
                                                    </div>
                                                    {doc.description && (
                                                        <div className="text-xs text-slate-500 line-clamp-2 break-words">
                                                            {doc.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* CREATOR */}
                                            <td className="px-2 py-4 align-top">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                                        {doc.creator_user_image_url ? (
                                                            <img src={doc.creator_user_image_url} alt={doc.creator_name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-xs">
                                                                {doc.creator_name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-sm font-bold text-slate-900 leading-tight mb-0.5 break-words">{doc.creator_name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{doc?.user_category_abbr}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* ASSIGNED */}
                                            <td className="px-2 py-4 align-top">
                                                {doc.assigned ? (
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                                            {doc.assigned.user_image_url ? (
                                                                <img src={doc.assigned.user_image_url} alt={doc.assigned.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-xs">
                                                                    {doc.assigned.name?.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-sm font-bold text-slate-900 leading-tight mb-0.5 break-words">{doc.assigned.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full" title={doc.assigned?.user_category_abbr}>
                                                                {doc.assigned?.user_category_abbr}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                                                )}
                                            </td>

                                            {/* PROJECT */}
                                            <td className="px-2 py-4 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-slate-900 break-words">{doc.project_name}</span>
                                                    <span className="text-[10px] font-medium text-slate-500">مرحلة التشطيبات</span>
                                                </div>
                                            </td>

                                            {/* SUBMITTED */}
                                            <td className="px-2 py-6 align-top text-center">
                                                <span className={`text-xs font-bold uppercase ${doc.is_submitted ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {doc.is_submitted ? 'Yes' : 'No'}
                                                </span>
                                            </td>

                                            {/* ACTION */}
                                            <td className="px-2 py-6 align-top text-center">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight break-words">
                                                    {doc.next_workflow_action || '-'}
                                                </span>
                                            </td>

                                            {/* ACTIONS Button */}
                                            {/* ACTIONS Button */}
                                            <td className="px-2 py-4 align-top">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/documents/${doc.name}`}
                                                        className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                                                        title={t('common.view')}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>

                                                    {/* Edit Button */}
                                                    {(() => {
                                                        const isEditable = user?.userId === doc.owner && doc.workflow_state === 'Draft – Contractor Specialist Engineer';
                                                        return (
                                                            <Link
                                                                href={isEditable ? `/documents/${doc.name}/edit` : '#'}
                                                                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all border ${isEditable
                                                                    ? 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border-slate-100'
                                                                    : 'bg-slate-50/50 text-slate-300 border-slate-50 cursor-not-allowed'}`}
                                                                title={t('common.edit')}
                                                                aria-disabled={!isEditable}
                                                                onClick={(e) => !isEditable && e.preventDefault()}
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </Link>
                                                        );
                                                    })()}

                                                    {/* Re-Submit Button */}
                                                    {doc.can_re_submit === 1 && (
                                                        <button
                                                            onClick={() => handleReSubmit(doc)}
                                                            disabled={resubmitting === doc.name}
                                                            className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-all border border-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title={t('documents.resubmit') || 'Re-Submit'}
                                                        >
                                                            {resubmitting === doc.name ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <RefreshCw className="h-3.5 w-3.5" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                            {docList.map((doc, idx) => (
                                <motion.div
                                    key={`${doc.name}-mobile`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 flex-shrink-0">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="font-bold text-slate-900 truncate block max-w-[200px]">{doc.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{doc.document_type || '-'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Mobile Edit Button */}
                                            {(() => {
                                                const isEditable = user?.userId === doc.owner && doc.workflow_state === 'Draft – Contractor Specialist Engineer';
                                                return (
                                                    <Link
                                                        href={isEditable ? `/documents/${doc.name}/edit` : '#'}
                                                        className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${isEditable
                                                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white'
                                                            : 'bg-slate-50 text-slate-300 cursor-not-allowed shadow-none'}`}
                                                        title={t('common.edit')}
                                                        onClick={(e) => !isEditable && e.preventDefault()}
                                                    >
                                                        <Edit className="h-4.5 w-4.5" />
                                                    </Link>
                                                );
                                            })()}

                                            {/* Mobile Re-Submit Button */}
                                            {doc.can_re_submit === 1 && (
                                                <button
                                                    onClick={() => handleReSubmit(doc)}
                                                    disabled={resubmitting === doc.name}
                                                    className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={t('documents.resubmit') || 'Re-Submit'}
                                                >
                                                    {resubmitting === doc.name ? (
                                                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="h-4.5 w-4.5" />
                                                    )}
                                                </button>
                                            )}

                                            <Link
                                                href={`/documents/${doc.name}`}
                                                className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title={t('common.view')}
                                            >
                                                <Eye className="h-4.5 w-4.5" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.discipline')}</span>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                                                {doc.discipline || '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.status')}</span>
                                            <StatusBadge status={doc.status_category} />
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.stage')}</span>
                                            <span className="text-xs font-bold text-slate-500 italic text-right max-w-[50%]">
                                                {doc.workflow_state || '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.date')}</span>
                                            <span className="text-xs font-bold text-slate-500 dir-ltr">
                                                {doc.creation ? doc.creation.split(' ')[0] : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
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
            </div >
        </div >
    );
}
