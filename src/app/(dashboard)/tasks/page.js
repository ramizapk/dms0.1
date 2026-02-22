'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import PermissionGate from '@/components/auth/PermissionGate';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import WorkspaceGuard from '@/components/auth/WorkspaceGuard';
import {
    FileText, Eye, CheckSquare, ArrowUpRight, Filter, Search, ChevronLeft, ChevronRight,
    SlidersHorizontal, Calendar, User, Briefcase, Clock, Activity, CheckCircle2, AlertCircle,
    Edit, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
    const { t, isRTL } = useI18n();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await api.getTodoList();
                setData(response.message);
            } catch (err) {
                console.error("Error fetching tasks:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading && !data) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton type="table" rows={10} />
            </div>
        );
    }

    // Adapt data structure if needed. User response: { message: { success: true, data: [...] } }
    // My api.js returns data.
    // Wait, typical apiRequest returns `data`.
    // The user's response JSON shows:
    // { "message": { "success": true, "data": [...] } }
    // If apiRequest returns the JSON body, then `response.message` is the inner object.
    // So `response.message.data` is the array.

    const taskList = data?.docs || [];

    // Strip HTML tags for table display of rich text content
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    };

    // Use meta if available for simple info, but we won't implement full server-side pagination unless we know params
    const meta = data?.meta || {};

    return (
        <WorkspaceGuard workspace="المستندات">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <PageHeader
                        title={t('tasks.title')}
                        subtitle={t('tasks.subtitle')}
                    />
                </div>

                {/* Tasks Table */}
                <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
                    {taskList.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="overflow-x-auto hidden md:block">
                                <table className="w-full text-right rtl:text-right ltr:text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/50">
                                            <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-12">{t('documents.id') || '#'}</th>
                                            <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider ltr:text-left rtl:text-right min-w-[240px]">{t('documents.order') || 'Order'}</th>
                                            <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider ltr:text-left rtl:text-right min-w-[200px]">{t('documents.creator') || 'Creator'}</th>
                                            <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider ltr:text-left rtl:text-right min-w-[200px]">{t('documents.assigned') || 'Assigned'}</th>
                                            <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider ltr:text-left rtl:text-right min-w-[140px]">{t('documents.project') || 'Project'}</th>
                                            <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{t('documents.submitted') || 'Submitted'}</th>
                                            <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{t('documents.action') || 'Action'}</th>
                                            <th className="px-2 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{t('common.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {taskList.map((task, idx) => (
                                            <motion.tr
                                                key={task.name}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-slate-50/50 transition-colors group"
                                            >
                                                {/* ID */}
                                                <td className="px-2 py-6 text-center align-top">
                                                    <span className="text-xs font-bold text-slate-500">
                                                        {idx + 1}
                                                    </span>
                                                </td>

                                                {/* ORDER (Complex Cell) */}
                                                <td className="px-2 py-4 align-top">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="font-bold text-slate-900 text-sm tracking-tight">{task.name}</div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap ${task.submittal_kind === 'reverse' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                {task.submittal_kind || task.discipline}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                                                {task.creation ? new Date(task.creation).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : '-'}
                                                            </span>
                                                        </div>
                                                        {task.description && stripHtml(task.description) && (
                                                            <div className="text-xs text-slate-500 line-clamp-2">
                                                                {stripHtml(task.description)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* CREATOR */}
                                                <td className="px-2 py-4 align-top">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                                            {task.creator_user_image_url ? (
                                                                <img src={task.creator_user_image_url} alt={task.creator_name || task.created_by_name} className="h-full w-full object-cover" />
                                                            ) : task.created_by_image ? (
                                                                <img src={`https://app.dms.salasah.sa${task.created_by_image}`} alt={task.creator_name || task.created_by_name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-xs">
                                                                    {(task.creator_name || task.created_by_name)?.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{task.creator_name || task.created_by_name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{task.user_category_abbr}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ASSIGNED */}
                                                <td className="px-2 py-4 align-top">
                                                    {task.assigned ? (
                                                        <div className="flex items-start gap-3">
                                                            <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                                                {task.assigned.user_image_url ? (
                                                                    <img src={task.assigned.user_image_url} alt={task.assigned.name} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-xs">
                                                                        {task.assigned.name?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <span className="text-sm font-bold text-slate-900 leading-tight mb-0.5 break-words">{task.assigned.name}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full" title={task.assigned?.user_category_abbr}>
                                                                    {task.assigned?.user_category_abbr}
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
                                                        <span className="text-sm font-bold text-slate-900">{task.project_name || '-'}</span>
                                                        <span className="text-[10px] font-medium text-slate-500">{task.discipline}</span>
                                                    </div>
                                                </td>

                                                {/* SUBMITTED */}
                                                <td className="px-2 py-6 align-top text-center">
                                                    <span className={`text-xs font-bold uppercase ${task.is_submitted ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {task.is_submitted ? 'Yes' : 'No'}
                                                    </span>
                                                </td>

                                                {/* ACTION */}
                                                <td className="px-2 py-6 align-top text-center">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight break-words">
                                                        {task.next_workflow_action || '-'}
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="px-2 py-4 align-top">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={`/documents/${task.name}`}
                                                            className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                                                            title={t('common.view')}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>

                                                        {/* Edit Button */}
                                                        <PermissionGate resource="Masar Document" action="write">
                                                            {(() => {
                                                                const isEditable = user?.userId === task.owner && task.workflow_state === 'Draft – Contractor Specialist Engineer';
                                                                return (
                                                                    <Link
                                                                        href={isEditable ? `/documents/${task.name}/edit` : '#'}
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
                                                        </PermissionGate>

                                                        {/* Re-Submit Button */}
                                                        <PermissionGate resource="Masar Document" action="create">
                                                            {task.can_re_submit === 1 && (
                                                                <Link
                                                                    href={`/documents/${task.name}/resubmit`}
                                                                    className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-all border border-amber-100"
                                                                    title={t('documents.resubmit') || 'Re-Submit'}
                                                                >
                                                                    <RefreshCw className="h-3.5 w-3.5" />
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

                            {/* Mobile Card View */}
                            <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                                {taskList.map((task, idx) => (
                                    <motion.div
                                        key={`${task.name}-mobile`}
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
                                                    <span className="font-bold text-slate-900 truncate block max-w-[200px]">{task.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{task.document_type || '-'}</span>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/documents/${task.name}`}
                                                className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title={t('common.view')}
                                            >
                                                <Eye className="h-4.5 w-4.5" />
                                            </Link>
                                        </div>

                                        {/* User Info Grid */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            {/* Creator */}
                                            <div className="space-y-2">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('documents.creator')}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-200">
                                                        {task.creator_user_image_url ? (
                                                            <img src={task.creator_user_image_url} alt={task.creator_name} className="h-full w-full object-cover rounded-lg" />
                                                        ) : task.created_by_image ? (
                                                            <img src={`https://app.dms.salasah.sa${task.created_by_image}`} alt={task.created_by_name || task.creator_name} className="h-full w-full object-cover rounded-lg" />
                                                        ) : (
                                                            (task.creator_name || task.created_by_name)?.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold text-slate-900 truncate">{task.creator_name || task.created_by_name}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{task?.user_category_abbr}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Assigned */}
                                            <div className="space-y-2">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('documents.assigned')}</div>
                                                {task.assigned ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-200">
                                                            {task.assigned.user_image_url ? (
                                                                <img src={task.assigned.user_image_url} alt={task.assigned.name} className="h-full w-full object-cover rounded-lg" />
                                                            ) : (
                                                                task.assigned.name?.charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-xs font-bold text-slate-900 truncate">{task.assigned.name}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{task.assigned?.user_category_abbr}</span>
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
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.project')}</span>
                                                <span className="text-xs font-bold text-slate-700">{task.project_name}</span>
                                            </div>

                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.discipline')}</span>
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                                                    {task.discipline || '-'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.submitted')}</span>
                                                <span className={`text-xs font-bold uppercase ${task.is_submitted ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {task.is_submitted ? 'Yes' : 'No'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.status')}</span>
                                                <StatusBadge status={task.status_category} />
                                            </div>

                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.action')}</span>
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                                                    {task.next_workflow_action || '-'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('documents.date')}</span>
                                                <span className="text-xs font-bold text-slate-500 dir-ltr">
                                                    {task.creation ? new Date(task.creation).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-24">
                            <EmptyState title={t('tasks.no_tasks')} icon={CheckSquare} />
                        </div>
                    )}
                </div>
            </div >
        </WorkspaceGuard>
    );
}
