'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import StatsCard from '@/components/ui/StatsCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import {
    FolderKanban, Building2, FileCheck, ClipboardCheck,
    MapPin, UserCircle, Calendar, ChevronRight, TrendingUp,
    FileText, CheckCircle2, XCircle, Clock, Plus
} from 'lucide-react';

export default function ProjectsPage() {
    const { t, isRTL } = useI18n();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await api.getProjectsDashboard();
                setData(response.message);
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        }
        fetchData();
    }, []);

    if (loading) return (<div className="space-y-12"><div className="h-12 w-80 skeleton" /><LoadingSkeleton type="cards" /><div className="grid grid-cols-1 gap-10 md:grid-cols-2">{[1, 2].map(i => (<div key={i} className="h-[400px] rounded-3xl skeleton" />))}</div></div>);
    if (error) return (<div className="flex flex-col items-center justify-center py-20 px-8 glass-card border-rose-500/20"><XCircle className="h-12 w-12 text-rose-500 mb-6" /><p className="text-lg font-bold text-white mb-2">{t('common.error')}</p><p className="text-slate-500 mb-8 max-w-md text-center">{error}</p><button onClick={() => window.location.reload()} className="rounded-2xl bg-indigo-600 px-10 py-4 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20">{t('common.retry')}</button></div>);

    const stats = data?.stats || {};
    const projects = data?.projects || [];
    const statsData = [
        { key: 'total_projects', value: stats.total, label: t('projects.total_projects'), icon: 'FolderKanban', gradient: 'from-indigo-600 to-violet-600', shadowColor: 'shadow-indigo-500/25' },
        { key: 'active', value: stats.active, label: t('projects.active_projects'), icon: 'TrendingUp', gradient: 'from-emerald-600 to-teal-600', shadowColor: 'shadow-emerald-500/25' },
        { key: 'docs', value: stats.docs, label: t('projects.total_docs'), icon: 'FileText', gradient: 'from-sky-600 to-blue-600', shadowColor: 'shadow-sky-500/25' },
        { key: 'approved', value: stats.approved, label: t('projects.approved_docs'), icon: 'CheckCircle2', gradient: 'from-amber-600 to-orange-600', shadowColor: 'shadow-amber-500/25' },
    ];

    return (
        <div className="space-y-12">
            <PageHeader title={t('projects.title')} subtitle={t('projects.subtitle')} actions={<button className="flex items-center gap-3 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all active:scale-95"><Plus className="h-4 w-4" />{t('projects.create_project') || 'Create Project'}</button>} />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {statsData.map((stat, index) => (<StatsCard key={stat.key} label={stat.label} value={stat.value} icon={stat.icon} gradient={stat.gradient} shadowColor={stat.shadowColor} index={index} />))}
            </div>
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                    {projects.map((project, i) => (
                        <motion.div key={project.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }} whileHover={{ y: -10 }} className="group relative">
                            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative glass-card h-full p-10 flex flex-col">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"><Building2 className="h-8 w-8 text-indigo-400" /></div>
                                        <div className="min-w-0"><h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors truncate leading-tight">{project.project_name}</h3><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{project.name}</p></div>
                                    </div>
                                    <div className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg ${project.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-emerald-500/5' : 'bg-slate-500/10 text-slate-400 border border-slate-500/25'}`}>{project.status === 'Open' ? t('projects.status_open') : t('projects.status_closed')}</div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                    <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500"><MapPin className="h-3.5 w-3.5" /><span className="text-[10px] font-bold uppercase tracking-widest">{t('projects.location') || 'Location'}</span></div><p className="text-sm font-bold text-slate-300 truncate">{project.custom_location || t('projects.not_specified')}</p></div>
                                    <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500"><UserCircle className="h-3.5 w-3.5" /><span className="text-[10px] font-bold uppercase tracking-widest">{t('projects.manager') || 'PM'}</span></div><p className="text-sm font-bold text-slate-300 truncate">{project.custom_project_manager || t('projects.not_specified')}</p></div>
                                    <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500"><Calendar className="h-3.5 w-3.5" /><span className="text-[10px] font-bold uppercase tracking-widest">{t('projects.due_date') || 'Deadline'}</span></div><p className="text-sm font-bold text-slate-300">{project.expected_end_date ? new Date(project.expected_end_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : t('projects.not_specified')}</p></div>
                                </div>
                                <div className="mb-10 flex-1">
                                    <div className="flex items-end justify-between mb-4"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{t('projects.completion')}</p><p className="text-3xl font-black text-indigo-400 tracking-tighter">{project.percent_complete}%</p></div><TrendingUp className="h-8 w-8 text-indigo-500/20 group-hover:text-indigo-500 transition-colors" /></div>
                                    <div className="h-4 w-full rounded-full bg-slate-900 overflow-hidden ring-4 ring-indigo-500/5"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(project.percent_complete, 2)}%` }} transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: 'circOut' }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]" /></div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {[{ key: 'total', value: project.doc_counts?.total, icon: FileText, color: 'text-slate-400', label: 'Docs' }, { key: 'approved', value: project.doc_counts?.approved, icon: CheckCircle2, color: 'text-emerald-400', label: 'Done' }, { key: 'rejected', value: project.doc_counts?.rejected, icon: XCircle, color: 'text-rose-400', label: 'Fail' }, { key: 'pending', value: project.doc_counts?.pending, icon: Clock, color: 'text-amber-400', label: 'Wait' }].map((item) => (
                                        <div key={item.key} className="group/item relative rounded-2xl bg-white/[0.03] p-4 text-center border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all"><item.icon className={`h-4 w-4 mx-auto mb-2 ${item.color} group-hover/item:scale-125 transition-transform`} /><p className={`text-xl font-black ${item.color} leading-none`}>{item.value ?? 0}</p><p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{t(`projects.${item.key}`) || item.label}</p></div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (<EmptyState title={t('projects.no_projects')} icon={FolderKanban} />)}
        </div>
    );
}
