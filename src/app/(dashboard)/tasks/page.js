'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import {
    FileText, Eye, CheckSquare, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
    const { t, isRTL } = useI18n();
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

    const taskList = data?.data || [];

    // Use meta if available for simple info, but we won't implement full server-side pagination unless we know params
    const meta = data?.meta || {};

    return (
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
                                {taskList.map((task, idx) => (
                                    <motion.tr
                                        key={task.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 max-w-[180px]">
                                                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0">
                                                    <CheckSquare className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 truncate" title={task.name}>{task.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-bold text-slate-600 truncate max-w-[120px] block" title={task.document_type}>
                                                {task.document_type || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[100px] block text-center" title={task.discipline}>
                                                {task.discipline || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={task.status_category} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-slate-500 truncate max-w-[150px] block" title={task.workflow_state}>
                                                {task.workflow_state || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-slate-500 dir-ltr text-right">
                                                {task.creation ? new Date(task.creation).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Open Action - The user specifically requested an "Open" action */}
                                                <Link
                                                    href={`/documents/${task.name}`}
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
                ) : (
                    <div className="py-24">
                        <EmptyState title={t('tasks.no_tasks')} icon={CheckSquare} />
                    </div>
                )}
            </div>
        </div >
    );
}
