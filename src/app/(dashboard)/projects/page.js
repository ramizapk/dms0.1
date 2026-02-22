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
    FileText, CheckCircle2, XCircle, Clock, Plus, Edit, Trash2, Eye
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import PermissionGate from '@/components/auth/PermissionGate';
import WorkspaceGuard from '@/components/auth/WorkspaceGuard';

export default function ProjectsPage() {
    const { t, isRTL } = useI18n();
    const { showToast } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeleting(true);
        try {
            const res = await api.deleteProject(projectToDelete.name);
            if (res.message && res.message.success) {
                showToast(t('projects.success_delete') || 'Project deleted successfully', 'success');
                // Optimistically update list or refetch
                const updatedProjects = data.projects.filter(p => p.name !== projectToDelete.name);
                setData({ ...data, projects: updatedProjects });
                setDeleteModalOpen(false);
                setProjectToDelete(null);
            }
        } catch (err) {
            console.error(err);
            showToast(err.message || t('common.error'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

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

    if (loading) return (
        <div className="space-y-12">
            <div className="h-12 w-80 skeleton max-w-full" />
            <LoadingSkeleton type="cards" />
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {[1, 2].map(i => (<div key={i} className="h-[400px] rounded-3xl skeleton" />))}
            </div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-20 px-8 bg-white rounded-3xl border border-rose-100 shadow-lg">
            <div className="h-20 w-20 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-rose-500" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 mb-2">{t('common.error')}</p>
            <p className="text-slate-500 mb-8 max-w-md text-center leading-relaxed">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
                {t('common.retry')}
            </button>
        </div>
    );

    const stats = data?.stats || {};
    const projects = data?.projects || [];
    const statsData = [
        { key: 'total_projects', value: stats.total, label: t('projects.total_projects'), icon: 'FolderKanban', gradient: 'from-indigo-600 to-violet-600', shadowColor: 'shadow-indigo-500/25' },
        { key: 'active', value: stats.active, label: t('projects.active_projects'), icon: 'TrendingUp', gradient: 'from-emerald-600 to-teal-600', shadowColor: 'shadow-emerald-500/25' },
        { key: 'docs', value: stats.docs, label: t('projects.total_docs'), icon: 'FileText', gradient: 'from-sky-600 to-blue-600', shadowColor: 'shadow-sky-500/25' },
        { key: 'approved', value: stats.approved, label: t('projects.approved_docs'), icon: 'CheckCircle2', gradient: 'from-amber-600 to-orange-600', shadowColor: 'shadow-amber-500/25' },
    ];

    return (
        <WorkspaceGuard workspace="المشاريع">
            <PermissionGate
                resource="Project"
                action="read"
                fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                        <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            You do not have permission to view projects. Please contact your administrator.
                        </p>
                        <Link
                            href="/dashboard"
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                }
            >
                <div className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <PageHeader
                            title={t('projects.title')}
                            subtitle={t('projects.subtitle')}
                        />
                        <PermissionGate resource="Project" action="create">
                            <Link
                                href="/projects/add"
                                className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Plus className="h-5 w-5" />
                                {t('projects.create_project') || 'Create Project'}
                            </Link>
                        </PermissionGate>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-full">
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

                    {projects.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 w-full max-w-full">
                            {projects.map((project, i) => (
                                <motion.div
                                    key={project.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                                    whileHover={{ y: -4 }}
                                    className="group relative h-full"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 rounded-[2rem] opacity-0 group-hover:opacity-100 group-hover:from-indigo-500/10 group-hover:via-violet-500/10 group-hover:to-blue-500/10 transition-all duration-500" />

                                    <div className="relative bg-white rounded-[1.75rem] border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200/50 p-6 h-full flex flex-col transition-all duration-300">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex gap-4 min-w-0">
                                                <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                                                    <Building2 className="h-7 w-7 text-indigo-600" />
                                                </div>
                                                <div className="min-w-0 pt-0.5">
                                                    <h3 className="text-lg font-bold text-slate-900 pr-4 leading-tight group-hover:text-indigo-600 transition-colors">
                                                        {project.project_name}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                        {project.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/projects/${project.name}`}
                                                    className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95"
                                                    title={t('common.view')}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Link>
                                                <PermissionGate resource="Project" action="write">
                                                    <Link
                                                        href={`/projects/${project.name}/edit`}
                                                        className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95"
                                                        title={t('common.edit')}
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Link>
                                                </PermissionGate>
                                                <PermissionGate resource="Project" action="delete">
                                                    <button
                                                        onClick={() => handleDeleteClick(project)}
                                                        className="h-7 w-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-100 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95"
                                                        title={t('common.delete')}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </PermissionGate>
                                                <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${project.status === 'Open' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                    {project.status === 'Open' ? t('projects.status_open') : t('projects.status_closed')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-slate-50/50 border border-slate-100/50">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">{t('projects.location')}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 truncate pl-4.5 border-l-2 border-slate-200">
                                                    {project.custom_location || t('projects.not_specified')}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <UserCircle className="h-3 w-3" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">{t('projects.manager')}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 truncate pl-4.5 border-l-2 border-slate-200">
                                                    {project.custom_project_manager || t('projects.not_specified')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Section */}
                                        <div className="mt-auto space-y-3 mb-6">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('projects.completion')}</span>
                                                <span className="text-2xl font-black text-slate-900 leading-none">{project.percent_complete}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.max(project.percent_complete, 5)}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_2px_10px_rgba(99,102,241,0.3)]"
                                                />
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-4 gap-2 pt-6 border-t border-slate-100">
                                            {[
                                                { key: 'total', value: project.doc_counts?.total, icon: FileText, color: 'text-slate-600 bg-slate-50', label: 'Docs' },
                                                { key: 'approved', value: project.doc_counts?.approved, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', label: 'Done' },
                                                { key: 'rejected', value: project.doc_counts?.rejected, icon: XCircle, color: 'text-rose-600 bg-rose-50', label: 'Fail' },
                                                { key: 'pending', value: project.doc_counts?.pending, icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Wait' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex flex-col items-center gap-1 group/stat">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover/stat:scale-110 ${item.color}`}>
                                                        <item.icon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">{item.value ?? 0}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{t(`projects.${item.key}`) || item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <EmptyState title={t('projects.no_projects')} icon={FolderKanban} />
                        </div>
                    )}

                    <DeleteConfirmationModal
                        isOpen={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        title={t('projects.delete_project')}
                        message={t('projects.delete_confirmation')}
                        isDeleting={isDeleting}
                    />
                </div>
            </PermissionGate>
        </WorkspaceGuard>
    );
}
