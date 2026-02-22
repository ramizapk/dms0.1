'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { STATS_CARDS, WORKSPACE_MAPPING } from '@/lib/constants';
import StatsCard from '@/components/ui/StatsCard';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import {
    FileText, FolderKanban, Clock, Activity, ArrowUpRight,
    TrendingUp, User, CheckCircle2, CheckSquare, Eye, Edit, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import PermissionGate from '@/components/auth/PermissionGate';

export default function DashboardPage() {
    const { t, isRTL } = useI18n();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [todoData, setTodoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [todoLoading, setTodoLoading] = useState(true);
    const [error, setError] = useState(null);

    // Permission Helper
    const hasAccess = (key) => {
        if (!user || !user.workspaces) return false;
        return user.workspaces.some(ws => WORKSPACE_MAPPING[ws] === key);
    };

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await api.getDashboardSummary();
                setData(response.message);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        async function fetchTodo() {
            if (!user?.userId) return;
            try {
                setTodoLoading(true);
                const response = await api.getTodoList();
                setTodoData(response.message?.docs || []);
            } catch (err) {
                console.error("Failed to fetch To-Do list", err);
            } finally {
                setTodoLoading(false);
            }
        }

        fetchData();
        fetchTodo();
    }, [user?.userId]);

    if (loading) {
        return (
            <div className="space-y-12">
                <div className="h-12 w-80 skeleton" />
                <LoadingSkeleton type="cards" />
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                    <div className="lg:col-span-2 h-96 skeleton" />
                    <div className="h-96 skeleton" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white rounded-2xl border border-rose-100 shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                    <Activity className="h-8 w-8 text-rose-500" />
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

    const counts = data?.counts || {};
    const statsData = [
        { ...STATS_CARDS[0], value: counts.total, label: t('dashboard.total') },
        { ...STATS_CARDS[1], value: counts.pending, label: t('dashboard.pending') },
        { ...STATS_CARDS[2], value: counts.review, label: t('dashboard.review') },
        { ...STATS_CARDS[3], value: counts.approved, label: t('dashboard.approved') },
        { ...STATS_CARDS[4], value: counts.rejected, label: t('dashboard.rejected') },
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Main Stage Header */}
            <div className="relative mb-12">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
                <PageHeader
                    title={`${t('dashboard.welcome')} ${user?.fullName || ''} `}
                    subtitle={t('dashboard.title')}
                />
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

            {/* Action Buttons & To-Do List Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Action Buttons (Left Side) */}
                <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between h-[500px]">
                    <div className="mb-6">
                        <h3 className="font-black text-lg text-slate-900 leading-none">{t('common.actions')}</h3>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">{t('documents.available_actions')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <PermissionGate resource="Masar Document" action="read">
                            <Link
                                href="/documents"
                                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 hover:-translate-y-1 transition-all group h-full"
                            >
                                <div className="h-10 w-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 text-center">{t('dashboard.action_submittals')}</span>
                            </Link>
                        </PermissionGate>

                        <PermissionGate resource="Masar Document" action="create">
                            <Link
                                href="/documents/add"
                                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 hover:-translate-y-1 transition-all group h-full"
                            >
                                <div className="h-10 w-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 text-center">{t('dashboard.action_new_submittal')}</span>
                            </Link>
                        </PermissionGate>

                        <Link
                            href="/tasks"
                            className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-amber-50 hover:border-amber-100 hover:-translate-y-1 transition-all group h-full"
                        >
                            <div className="h-10 w-10 rounded-xl bg-white text-amber-600 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <CheckSquare className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-amber-700 text-center">{t('dashboard.action_todo')}</span>
                        </Link>


                        {hasAccess('projects') && (
                            <PermissionGate resource="Project" action="read">
                                <Link
                                    href="/projects"
                                    className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-violet-50 hover:border-violet-100 hover:-translate-y-1 transition-all group h-full"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-white text-violet-600 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                        <FolderKanban className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 group-hover:text-violet-700 text-center">{t('dashboard.action_projects')}</span>
                                </Link>
                            </PermissionGate>
                        )}
                    </div>
                </div>

                {/* To-Do List (Right Side) */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                                <CheckSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-slate-900 leading-none">{t('dashboard.todo_list_title')}</h3>
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1">{t('dashboard.todo_list_subtitle')}</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                            {todoData?.length || 0} Tasks
                        </span>
                    </div>

                    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                        {todoLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4 animate-pulse">
                                        <div className="h-10 w-10 rounded-lg bg-slate-100" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 rounded bg-slate-100" />
                                            <div className="h-3 w-1/2 rounded bg-slate-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : todoData?.length > 0 ? (
                            <table className="w-full text-left rtl:text-right text-sm">
                                <thead className="bg-white text-slate-500 font-bold text-[10px] uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 bg-slate-50 text-left ltr:text-left rtl:text-right">{t('documents.task') || 'Task'}</th>
                                        <th className="px-4 py-3 bg-slate-50 text-center">{t('documents.action') || 'Action'}</th>
                                        <th className="px-4 py-3 bg-slate-50 text-center">{t('common.actions') || 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {todoData.map((doc) => (
                                        <tr key={doc.name} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-4 py-4 w-full">
                                                <div className="flex items-start gap-4 h-full">
                                                    <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                        {doc.created_by_image ? (
                                                            <img src={`https://app.dms.salasah.sa${doc.created_by_image}`} alt={doc.created_by_name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-sm">
                                                                {doc.creator_name ? doc.creator_name.charAt(0) : doc.created_by_name ? doc.created_by_name.charAt(0) : 'U'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2 min-w-0">
                                                        <div className="font-bold text-slate-900 text-sm tracking-tight break-words">{doc.name}</div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap ${doc.submittal_kind === 'reverse' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                {doc.submittal_kind || doc.discipline}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                                                {doc.creation ? new Date(doc.creation).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top text-center">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight break-words">
                                                    {doc.next_workflow_action || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 align-top text-center">
                                                <div className="flex items-center justify-center">
                                                    <Link
                                                        href={`/documents/${doc.name}`}
                                                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <CheckCircle2 className="h-10 w-10 mb-3 opacity-20" />
                                <p className="text-sm font-medium">No pending tasks</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Insights & Feed Section */}
            <div className="flex flex-col gap-8">
                {/* Documents Data Feed - Full Width */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="premium-card flex flex-col"
                >
                    <div className="px-6 py-5 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm group">
                                <FileText className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">{t('dashboard.recent_documents')}</h2>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide mt-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    {t('dashboard.live_feed')}
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/documents"
                            className="group flex items-center gap-2 text-[10px] font-black text-slate-600 hover:text-indigo-600 transition-all px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md active:scale-95"
                        >
                            {t('dashboard.view_all')}
                            <ArrowUpRight className="h-3 w-3 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex-1">
                        {data?.docs?.length > 0 ? (
                            <div className="luxury-table-container">
                                <table className="w-full text-right rtl:text-right ltr:text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/30">
                                            <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center w-8">{t('documents.id') || 'ID'}</th>
                                            <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight ltr:text-left rtl:text-right">{t('documents.order') || 'Order'}</th>
                                            <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight ltr:text-left rtl:text-right">{t('documents.creator') || 'Creator'}</th>
                                            <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight ltr:text-left rtl:text-right">{t('documents.assigned') || 'Assigned'}</th>
                                            <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight ltr:text-left rtl:text-right">{t('documents.project') || 'Project'}</th>
                                            <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center">{t('documents.submitted') || 'Submitted'}</th>
                                            <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center">{t('documents.action') || 'Action'}</th>
                                            <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center">{t('documents.actions') || 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.docs.map((doc, idx) => (
                                            <motion.tr
                                                key={doc.name}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="hover:bg-slate-50/50 transition-colors group"
                                            >
                                                {/* ID */}
                                                <td className="px-2 py-3 text-center align-top">
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {idx + 1}
                                                    </span>
                                                </td>

                                                {/* ORDER */}
                                                <td className="px-2 py-2 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="font-bold text-slate-900 text-xs tracking-tight break-words">{doc.name}</div>
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase font-bold tracking-wide border whitespace-nowrap ${doc.submittal_kind === 'reverse' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                {doc.submittal_kind || doc.discipline}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                                                {doc.creation ? new Date(doc.creation).toLocaleString() : '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* CREATOR */}
                                                <td className="px-2 py-2 align-top">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                                            {doc.creator_user_image_url ? (
                                                                <img src={doc.creator_user_image_url} alt={doc.creator_name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-[10px]">
                                                                    {doc.creator_name?.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-xs font-bold text-slate-900 leading-tight mb-0.5 break-words">{doc.creator_name}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-normal">{doc?.user_category_abbr}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ASSIGNED */}
                                                <td className="px-2 py-2 align-top">
                                                    {doc.assigned ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-7 w-7 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                                                {doc.assigned.user_image_url ? (
                                                                    <img src={doc.assigned.user_image_url} alt={doc.assigned.name} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-[10px]">
                                                                        {doc.assigned.name?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <span className="text-xs font-bold text-slate-900 leading-tight mb-0.5 break-words">{doc.assigned.name}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-normal truncate max-w-full" title={doc.assigned?.user_category_abbr}>
                                                                    {doc.assigned?.user_category_abbr}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                                                    )}
                                                </td>

                                                {/* PROJECT */}
                                                <td className="px-2 py-2 align-top">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-bold text-slate-900 break-words">{doc.project_name}</span>
                                                        <span className="text-[9px] font-medium text-slate-500">مرحلة التشطيبات</span>
                                                    </div>
                                                </td>

                                                {/* SUBMITTED */}
                                                <td className="px-2 py-3 align-top text-center">
                                                    <span className={`text-[10px] font-bold uppercase ${doc.is_submitted ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {doc.is_submitted ? 'Yes' : 'No'}
                                                    </span>
                                                </td>

                                                {/* ACTION */}
                                                <td className="px-2 py-3 align-top text-center">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight break-words">
                                                        {doc.next_workflow_action || '-'}
                                                    </span>
                                                </td>

                                                {/* ACTIONS Button */}
                                                <td className="px-2 py-2 align-top">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Link
                                                            href={`/documents/${doc.name}`}
                                                            className="h-7 w-7 rounded-md bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                                                            title={t('common.view')}
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </Link>

                                                        {/* Edit Button */}
                                                        <PermissionGate resource="Masar Document" action="write">
                                                            {(() => {
                                                                const isEditable = user?.userId === doc.owner && doc.workflow_state === 'Draft – Contractor Specialist Engineer';
                                                                return (
                                                                    <Link
                                                                        href={isEditable ? `/documents/${doc.name}/edit` : '#'}
                                                                        className={`h-7 w-7 rounded-md flex items-center justify-center transition-all border ${isEditable
                                                                            ? 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border-slate-100'
                                                                            : 'bg-slate-50/50 text-slate-300 border-slate-50 cursor-not-allowed'}`}
                                                                        title={t('common.edit')}
                                                                        aria-disabled={!isEditable}
                                                                        onClick={(e) => !isEditable && e.preventDefault()}
                                                                    >
                                                                        <Edit className="h-3 w-3" />
                                                                    </Link>
                                                                );
                                                            })()}
                                                        </PermissionGate>

                                                        {/* Re-Submit Button */}
                                                        <PermissionGate resource="Masar Document" action="create">
                                                            {doc.can_re_submit === 1 && (
                                                                <Link
                                                                    href={`/documents/${doc.name}/resubmit`}
                                                                    className="h-7 w-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-all border border-amber-100"
                                                                    title={t('documents.resubmit') || 'Re-Submit'}
                                                                >
                                                                    <RefreshCw className="h-3 w-3" />
                                                                </Link>
                                                            )}
                                                        </PermissionGate>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12">
                                <EmptyState title={t('dashboard.no_documents')} icon={FileText} />
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="premium-card flex flex-col bg-slate-50/30"
                >
                    <div className="px-10 py-10 flex items-center gap-5 border-b border-white">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xl shadow-emerald-500/5">
                            <Activity className="h-7 w-7 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{t('dashboard.recent_activities')}</h2>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">{t('dashboard.activity_log')}</p>
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto max-h-[600px] scrollbar-hide">
                        {data?.activities?.length > 0 ? (
                            <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-7 rtl:before:right-7 before:w-[2px] before:bg-gradient-to-b before:from-emerald-500/20 before:via-indigo-500/20 before:to-transparent">
                                {data.activities.map((activity, i) => (
                                    <motion.div
                                        key={`${activity.docname}-${i}`}
                                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.05 }}
                                        className="relative pl-14 rtl:pl-0 rtl:pr-14 group"
                                    >
                                        {/* Timeline Dot */}
                                        <div className="absolute left-6 rtl:left-auto rtl:right-6 top-6 -translate-x-1/2 rtl:translate-x-1/2 flex h-4 w-4 items-center justify-center z-10">
                                            <div className="h-3 w-3 rounded-full border-[3px] border-white bg-slate-300 ring-4 ring-slate-100/50 group-hover:scale-125 group-hover:bg-emerald-500 group-hover:ring-emerald-100 transition-all duration-500" />
                                        </div>

                                        <div className="flex flex-col gap-4 rounded-3xl bg-white border border-slate-200/60 p-6 shadow-sm group-hover:shadow-xl group-hover:border-emerald-200/50 group-hover:-translate-y-1 transition-all duration-500">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 font-black text-sm border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500">
                                                    {activity.user_full_name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-black text-slate-900 truncate leading-none mb-1.5">
                                                        {activity.user_full_name}
                                                    </p>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                                        {new Date(activity.creation).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <p className="text-sm font-bold text-slate-600 leading-snug">
                                                    {activity.action} <span className="text-indigo-600 font-extrabold">{activity.docname}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20">
                                <EmptyState title={t('dashboard.no_activities')} icon={Activity} />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>


            {/* Projects Showcase Area - Light Mode Redesign */}
            {hasAccess('projects') && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="rounded-[32px] border border-slate-200 bg-slate-50/50 p-8 sm:p-12"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div className="flex items-center gap-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
                                <FolderKanban className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{t('dashboard.projects_overview')}</h2>
                                <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-3">{t('dashboard.portfolio_tracking')}</p>
                            </div>
                        </div>
                        <Link
                            href="/projects"
                            className="group flex items-center justify-center gap-4 text-sm font-black text-indigo-600 hover:text-white transition-all px-8 py-4 rounded-2xl bg-white hover:bg-indigo-600 border border-slate-200 hover:border-indigo-600 shadow-sm hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 whitespace-nowrap"
                        >
                            {t('dashboard.view_all')}
                            <ArrowUpRight className="h-5 w-5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="relative z-10">
                        {data?.projects?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {data.projects.map((project, i) => (
                                    <motion.div
                                        key={project.name}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                                        className="group relative flex flex-col p-8 rounded-[24px] bg-white border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="space-y-1.5 min-w-0">
                                                <h3 className="font-black text-lg text-slate-900 group-hover:text-indigo-600 transition-colors truncate pr-4">{project.project_name}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{project.name}</p>
                                            </div>
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                                                <TrendingUp className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-end justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('projects.completion')}</p>
                                                    <p className="text-3xl font-black text-slate-900 leading-none mt-1">{project.percent_complete}%</p>
                                                </div>
                                                <div className="flex -space-x-2 rtl:space-x-reverse">
                                                    {[1, 2, 3].map((u) => (
                                                        <div key={u} className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">
                                                            {u === 1 ? 'JD' : u === 2 ? 'AK' : '+5'}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="relative h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${project.percent_complete}%` }}
                                                    transition={{ duration: 1.5, delay: 1 + i * 0.1, ease: 'easeOut' }}
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 rounded-full"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-auto">
                                                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                                    Active Now
                                                </div>
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500/20 group-hover:text-emerald-500 transition-colors duration-300" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                                <EmptyState title={t('dashboard.no_projects')} icon={FolderKanban} />
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
