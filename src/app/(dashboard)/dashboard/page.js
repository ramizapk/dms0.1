'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { STATS_CARDS } from '@/lib/constants';
import StatsCard from '@/components/ui/StatsCard';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import {
    FileText, FolderKanban, Clock, Activity, ArrowUpRight,
    TrendingUp, User, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { t, isRTL } = useI18n();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        fetchData();
    }, []);

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
            <div className="flex flex-col items-center justify-center py-32 space-y-8 glass-card">
                <div className="h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <Activity className="h-8 w-8 text-rose-500" />
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-white mb-2">{t('common.error')}</p>
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
    ];

    return (
        <div className="space-y-16">
            {/* Main Stage Header */}
            <PageHeader
                title={`${t('dashboard.welcome')}، ${user?.fullName || ''} 👋`}
                subtitle={t('dashboard.title')}
            />

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* Insights & Feed Section */}
            <div className="grid grid-cols-1 gap-12 xl:grid-cols-3">
                {/* Documents Data Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="xl:col-span-2 glass-card overflow-hidden flex flex-col"
                >
                    <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
                                <FileText className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-white tracking-tight">{t('dashboard.recent_documents')}</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live Feed</p>
                            </div>
                        </div>
                        <Link
                            href="/documents"
                            className="group flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-white transition-all px-5 py-2.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500 border border-indigo-500/10 hover:border-indigo-400"
                        >
                            {t('dashboard.view_all')}
                            <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex-1 p-2">
                        {data?.docs?.length > 0 ? (
                            <div className="data-table-container border-0 bg-transparent">
                                <table className="data-table w-full">
                                    <thead>
                                        <tr>
                                            <th>{t('documents.name')}</th>
                                            <th>{t('documents.workflow_state')}</th>
                                            <th>{t('documents.status')}</th>
                                            <th>{t('documents.creation_date')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.docs.map((doc, i) => (
                                            <motion.tr
                                                key={doc.name}
                                                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + i * 0.05 }}
                                                className="group"
                                            >
                                                <td className="py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 w-2 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">{doc.name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-xs font-medium text-slate-400 max-w-[240px] truncate block leading-relaxed italic">
                                                        {doc.workflow_state}
                                                    </span>
                                                </td>
                                                <td>
                                                    <StatusBadge status={doc.status_category} />
                                                </td>
                                                <td>
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                        {new Date(doc.creation).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-20">
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
                    className="glass-card flex flex-col"
                >
                    <div className="px-8 py-8 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                <Activity className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-white tracking-tight">{t('dashboard.recent_activities')}</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Timeline</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-8">
                        {data?.activities?.length > 0 ? (
                            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-6 rtl:before:right-6 before:w-px before:bg-white/5">
                                {data.activities.map((activity, i) => (
                                    <motion.div
                                        key={`${activity.docname}-${i}`}
                                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.05 }}
                                        className="relative pl-12 rtl:pl-0 rtl:pr-12 group"
                                    >
                                        <div className="absolute left-4.5 rtl:left-auto rtl:right-4.5 top-0 flex h-3 w-3 items-center justify-center">
                                            <div className="h-2 w-2 rounded-full border border-white/20 bg-slate-900 ring-4 ring-emerald-500/10 group-hover:scale-150 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all duration-300" />
                                        </div>

                                        <div className="flex items-start gap-4 rounded-2xl bg-white/[0.02] border border-white/5 p-5 group-hover:bg-white/5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all duration-300">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/10">
                                                <User className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white mb-0.5">
                                                    {activity.user_full_name}
                                                </p>
                                                <p className="text-xs text-slate-400 leading-snug">
                                                    <span className="text-emerald-400 font-bold">{activity.action}</span>
                                                    {' · '}
                                                    <span className="text-slate-300 font-medium">{activity.docname}</span>
                                                </p>
                                                <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-white/5 w-fit px-2 py-1 rounded-md">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(activity.creation).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState title={t('dashboard.no_activities')} icon={Activity} />
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Projects Showcase Area */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="glass-card"
            >
                <div className="px-10 py-10 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <FolderKanban className="h-7 w-7 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">{t('dashboard.projects_overview')}</h2>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Portfolio Tracking</p>
                        </div>
                    </div>
                    <Link
                        href="/projects"
                        className="group flex items-center gap-3 text-sm font-black text-amber-400 hover:text-white transition-all px-6 py-3 rounded-2xl bg-amber-500/5 hover:bg-amber-500 border border-amber-500/10 hover:border-amber-400"
                    >
                        {t('dashboard.view_all')}
                        <ArrowUpRight className="h-5 w-5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                </div>

                <div className="p-10">
                    {data?.projects?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            {data.projects.map((project, i) => (
                                <motion.div
                                    key={project.name}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -6 }}
                                    className="group rounded-3xl bg-white/[0.03] border border-white/5 p-8 hover:bg-white/[0.06] hover:border-amber-500/30 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1 min-w-0">
                                            <h3 className="font-black text-xl text-white group-hover:text-amber-300 transition-colors truncate">{project.project_name}</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{project.name}</p>
                                        </div>
                                        <TrendingUp className="h-6 w-6 text-slate-700 group-hover:text-amber-500 transition-colors" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('projects.completion')}</span>
                                            <span className="text-lg font-black text-amber-400">{project.percent_complete}%</span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-slate-900 group-hover:bg-slate-800 transition-colors overflow-hidden ring-4 ring-amber-500/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${project.percent_complete}%` }}
                                                transition={{ duration: 1.5, delay: 1 + i * 0.1, ease: 'easeOut' }}
                                                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title={t('dashboard.no_projects')} icon={FolderKanban} />
                    )}
                </div>
            </motion.div>
        </div>
    );
}
