'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
    Briefcase,
    Plus,
    Edit,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import PermissionGate from '@/components/auth/PermissionGate';
import WorkspaceGuard from '@/components/auth/WorkspaceGuard';

export default function ProjectPartiesPage() {
    const { t, isRTL } = useI18n();
    const { showToast } = useToast();
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [partyToDelete, setPartyToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (party) => {
        setPartyToDelete(party);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!partyToDelete) return;

        setIsDeleting(true);
        try {
            const partyName = partyToDelete.name;
            const res = await api.deleteProjectPartyProfile(partyName);
            if (res.message && res.message.success) {
                showToast(isRTL ? (res.message.message_ar || 'تم حذف الجهة بنجاح') : (res.message.message || 'Party deleted successfully'), 'success');
                setParties(parties.filter(p => p.name !== partyToDelete.name));
                setDeleteModalOpen(false);
                setPartyToDelete(null);
            }
        } catch (err) {
            console.error(err);
            showToast(err.message || t('common.error'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        async function fetchParties() {
            try {
                setLoading(true);
                const response = await api.getProjectPartyProfiles();
                // Assumes response structure is { message: { success: true, data: [...] } }
                setParties(response?.message?.data || response?.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchParties();
    }, []);

    if (loading) {
        return (
            <div className="space-y-12">
                <div className="h-12 w-80 skeleton" />
                <LoadingSkeleton type="table" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white rounded-2xl border border-rose-100 shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                    <Briefcase className="h-8 w-8 text-rose-500" />
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

    return (
        <WorkspaceGuard workspace="ملفات-الأطراف">
            <PermissionGate
                resource="Project Party Profile"
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
                            You do not have permission to view project parties. Please contact your administrator.
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
                <div className="space-y-12 pb-20">
                    {/* Header */}
                    <div className="relative mb-12">
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <PageHeader
                                title={t('project_parties.title')}
                                subtitle={t('project_parties.subtitle')}
                            />
                            <PermissionGate resource="Project Party Profile" action="create">
                                <Link
                                    href="/project-parties/add"
                                    className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <Plus className="h-5 w-5" />
                                    {t('project_parties.add_party')}
                                </Link>
                            </PermissionGate>
                        </div>
                    </div>

                    {/* Parties List */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="premium-card flex flex-col"
                    >
                        <div className="px-10 py-10 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xl shadow-indigo-500/5 group">
                                    <Briefcase className="h-7 w-7 text-indigo-600 transition-transform group-hover:scale-110" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{t('project_parties.title')}</h2>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">
                                        {parties.length} {t('common.total_records')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1">
                            {parties.length > 0 ? (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden md:block luxury-table-container">
                                        <table className="luxury-table">
                                            <thead>
                                                <tr>
                                                    <th>{t('project_parties.name')}</th>
                                                    <th>{t('project_parties.type')}</th>
                                                    <th>{t('common.actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {parties.map((party, i) => (
                                                    <motion.tr
                                                        key={party.name}
                                                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 + i * 0.05 }}
                                                        className="group"
                                                    >
                                                        <td>
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 uppercase overflow-hidden">
                                                                    {party.company_logo ? (
                                                                        <img src={party.company_logo.startsWith('http') ? party.company_logo : `https://app.dms.salasah.sa${party.company_logo}`} alt={party.name} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <Briefcase className="w-5 h-5 opacity-50" />
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{isRTL ? party.party_name_arabic || party.name : party.party_name_english || party.name}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400 tracking-tighter">{party.name}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold border border-indigo-100">
                                                                {party.party_type || '-'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="flex items-center gap-2">
                                                                <PermissionGate resource="Project Party Profile" action="write">
                                                                    <Link
                                                                        href={`/project-parties/${encodeURIComponent(party.name)}/edit`}
                                                                        className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                                        title={t('common.edit')}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                </PermissionGate>
                                                                <PermissionGate resource="Project Party Profile" action="delete">
                                                                    <button
                                                                        onClick={() => handleDeleteClick(party)}
                                                                        className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                                                        title={t('common.delete')}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
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
                                        {parties.map((party, i) => (
                                            <motion.div
                                                key={party.name}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + i * 0.05 }}
                                                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 uppercase flex-shrink-0 overflow-hidden">
                                                            {party.company_logo ? (
                                                                <img src={party.company_logo.startsWith('http') ? party.company_logo : `https://app.dms.salasah.sa${party.company_logo}`} alt={party.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <Briefcase className="w-5 h-5 opacity-50" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-slate-900">{isRTL ? party.party_name_arabic || party.name : party.party_name_english || party.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 tracking-tighter">{party.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <PermissionGate resource="Project Party Profile" action="write">
                                                            <Link
                                                                href={`/project-parties/${encodeURIComponent(party.name)}/edit`}
                                                                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                                title={t('common.edit')}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </PermissionGate>
                                                        <PermissionGate resource="Project Party Profile" action="delete">
                                                            <button
                                                                onClick={() => handleDeleteClick(party)}
                                                                className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                                                title={t('common.delete')}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </PermissionGate>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center py-2 border-t border-slate-50">
                                                        <span className="text-xs font-bold text-slate-400 uppercase">{t('project_parties.type')}</span>
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold border border-indigo-100">
                                                            {party.party_type || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="py-24">
                                    <EmptyState title={t('project_parties.no_parties')} icon={Briefcase} />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <DeleteConfirmationModal
                        isOpen={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        title={t('project_parties.delete_party')}
                        message={t('project_parties.delete_confirmation')}
                        isDeleting={isDeleting}
                    />
                </div>
            </PermissionGate>
        </WorkspaceGuard>
    );
}
