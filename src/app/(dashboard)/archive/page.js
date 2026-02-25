'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/ui/StatsCard';
import WorkspaceGuard from '@/components/auth/WorkspaceGuard';
import MiniStatBadge from '@/components/ui/MiniStatBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
    Archive,
    FileText,
    Calendar,
    CheckCircle2,
    Filter,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Inbox,
    Send,
    FileCheck
} from 'lucide-react';
import Link from 'next/link';

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
    const [filters, setFilters] = useState({
        document_type: '',
        discipline: '',
        project_name: '',
        date_from: '',
        date_to: '',
        search: '',
    });
    const [page, setPage] = useState(1);
    const pageLength = 20;

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await api.getProjectsDropdownList();
                if (response.message && response.message.data) {
                    setProjects(response.message.data);
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            }
        }
        fetchProjects();
    }, []);

    // Strip HTML tags for table display of rich text content
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    };

    async function fetchData() {
        try {
            setLoading(true);
            const startParams = (page - 1) * pageLength;

            const params = {
                start: startParams,
                page_length: pageLength,
                filters: { ...filters } // Pass filters object
            };

            const response = await api.getArchiveFull(params);
            setData(response.message);
        } catch (err) {
            console.error("Error fetching archive data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [page, filters]);

    if (loading && !data) {
        return (
            <div className="space-y-12">
                <div className="h-12 w-80 skeleton" />
                <LoadingSkeleton type="cards" />
                <div className="h-96 skeleton" />
            </div>
        );
    }

    if (error && !data) {
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

    const docList = data?.docs || [];
    const pagination = data?.pagination || {};
    const stats = data?.stats || {};
    const statsData = [
        { ...ARCHIVE_STATS[0], value: stats.total_approved, label: t('archive.total_approved') },
        { ...ARCHIVE_STATS[1], value: stats.approved_this_month, label: t('archive.approved_this_month') },
        { ...ARCHIVE_STATS[2], value: stats.filtered_total, label: t('archive.filtered_total') },
    ];

    return (
        <WorkspaceGuard workspace="الأرشيف">
            <div className="space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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

                {
                    data?.meta?.by_type && (
                        <div className="flex items-center justify-center gap-3 overflow-x-auto flex-wrap pb-2 scrollbar-hide">
                            {data.meta.by_type.map((dt, idx) => (
                                <MiniStatBadge
                                    key={`${dt.abbr}-${idx}`}
                                    abbr={dt.abbr}
                                    count={dt.count || 0}
                                    isActive={filters.document_type === dt.name}
                                    onClick={() => {
                                        setFilters({ ...filters, document_type: filters.document_type === dt.name ? '' : dt.name });
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
                        <div className="relative md:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('documents.search_placeholder')}
                                value={filters.search}
                                onChange={(e) => {
                                    setFilters({ ...filters, search: e.target.value });
                                    setPage(1);
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
                                    setPage(1);
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
                                    setPage(1);
                                }}
                                className="w-full pl-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                            >
                                <option value="">{t('documents.all_disciplines')}</option>
                                {data?.meta?.disciplines?.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        {/* Project Filter - Dropdown */}
                        <div className="relative">
                            <Archive className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <select
                                value={filters.project_name}
                                onChange={(e) => {
                                    setFilters({ ...filters, project_name: e.target.value });
                                    setPage(1);
                                }}
                                className="w-full pl-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                            >
                                <option value="">{t('documents.all_projects') || 'All Projects'}</option>
                                {projects.map((project) => (
                                    <option key={project.value} value={project.value}>
                                        {project.project_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date Filters Row */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 pt-4 border-t border-slate-100">
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

                {/* Documents List */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden"
                >
                    {docList.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="overflow-x-auto w-full max-w-full hidden md:block">
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
                                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap ${doc.submittal_kind === 'reverse' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                {doc.submittal_kind || doc.discipline}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                                                {doc.creation ? new Date(doc.creation).toLocaleString() : '-'}
                                                            </span>
                                                        </div>
                                                        {doc.description && stripHtml(doc.description) && (
                                                            <div className="text-xs text-slate-500 line-clamp-2 break-words">
                                                                {stripHtml(doc.description)}
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

                                                {/* ACTIONS Button - VIEW ONLY */}
                                                <td className="px-2 py-4 align-top">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={`/documents/${doc.name}`}
                                                            className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
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
                                        {/* Header: Type, ID, View Action */}
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
                                                <Link
                                                    href={`/documents/${doc.name}`}
                                                    className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title={t('common.view')}
                                                >
                                                    <Eye className="h-4.5 w-4.5" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {doc.description && stripHtml(doc.description) && (
                                            <div className="mb-4 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                {stripHtml(doc.description)}
                                            </div>
                                        )}

                                        {/* Project */}
                                        <div className="mb-4">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('documents.project')}</div>
                                            <div className="font-bold text-slate-900 text-sm">{doc.project_name}</div>
                                            <div className="text-[10px] font-medium text-slate-500">مرحلة التشطيبات</div>
                                        </div>

                                        {/* User Info Grid */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            {/* Creator */}
                                            <div className="space-y-2">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('documents.creator')}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-200">
                                                        {doc.creator_user_image_url ? (
                                                            <img src={doc.creator_user_image_url} alt={doc.creator_name} className="h-full w-full object-cover rounded-lg" />
                                                        ) : (
                                                            doc.creator_name?.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold text-slate-900 truncate">{doc.creator_name}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{doc?.user_category_abbr}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Assigned */}
                                            <div className="space-y-2">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('documents.assigned')}</div>
                                                {doc.assigned ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-200">
                                                            {doc.assigned.user_image_url ? (
                                                                <img src={doc.assigned.user_image_url} alt={doc.assigned.name} className="h-full w-full object-cover rounded-lg" />
                                                            ) : (
                                                                doc.assigned.name?.charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-xs font-bold text-slate-900 truncate">{doc.assigned.name}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{doc.assigned?.user_category_abbr}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info List */}
                                        <div className="space-y-3 pt-3 border-t border-slate-100">
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.discipline')}</span>
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                                                    {doc.discipline || '-'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.submitted')}</span>
                                                <span className={`text-xs font-bold uppercase ${doc.is_submitted ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {doc.is_submitted ? 'Yes' : 'No'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.status')}</span>
                                                {/* Status Badge logic - assuming same as Documents page or simplistic */}
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${doc.status_category === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                    {doc.status_category || doc.workflow_state}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.action')}</span>
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                                                    {doc.next_workflow_action || '-'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2">
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
                            <EmptyState title={t('archive.no_documents')} icon={Archive} />
                        </div>
                    )}
                </motion.div>
            </div>
        </WorkspaceGuard>
    );
}
