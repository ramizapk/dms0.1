'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
    Users,
    Plus,
    Search,
    UserCheck,
    UserX,
    Edit,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

export default function UsersPage() {
    const { t, isRTL } = useI18n();
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            // The API requires the email to be passed as the 'name' parameter
            const userEmail = userToDelete.email || userToDelete.name;
            const res = await api.disableUser(userEmail);
            if (res.message && res.message.success) {
                showToast(isRTL ? (res.message.message_ar || 'تم حذف المستخدم بنجاح') : (res.message.message || 'User deleted successfully'), 'success');
                setUsers(users.filter(u => u.name !== userToDelete.name));
                setDeleteModalOpen(false);
                setUserToDelete(null);
            }
        } catch (err) {
            console.error(err);
            showToast(err.message || t('common.error'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true);
                const response = await api.getUsers();
                setUsers(response.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
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
                    <Users className="h-8 w-8 text-rose-500" />
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
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="relative mb-12">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <PageHeader
                        title={t('users.title')}
                        subtitle={t('users.subtitle')}
                    />
                    <Link
                        href="/users/add"
                        className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        {t('users.add_user')}
                    </Link>
                </div>
            </div>

            {/* Users List */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="premium-card flex flex-col"
            >
                <div className="px-10 py-10 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xl shadow-indigo-500/5 group">
                            <Users className="h-7 w-7 text-indigo-600 transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{t('users.title')}</h2>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">
                                {users.length} {t('common.total_records')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    {users.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block luxury-table-container">
                                <table className="luxury-table">
                                    <thead>
                                        <tr>
                                            <th>{t('users.name')}</th>
                                            <th>{t('users.email')}</th>
                                            <th>{t('users.role')}</th>
                                            <th>{t('users.status')}</th>
                                            <th>{t('common.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users.map((user, i) => (
                                            <motion.tr
                                                key={user.name}
                                                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + i * 0.05 }}
                                                className="group"
                                            >
                                                <td>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 uppercase">
                                                            {user.user_image ? (
                                                                <img src={user.user_image.startsWith('http') ? user.user_image : `https://dms.salasah.sa${user.user_image}`} alt={user.full_name} className="h-full w-full object-cover rounded-xl" />
                                                            ) : (
                                                                user.full_name?.charAt(0) || 'U'
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.full_name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.designation || '-'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-sm font-bold text-slate-600">{user.email}</span>
                                                </td>
                                                <td>
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold border border-indigo-100">
                                                        {user.role_profile_name || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit ${user.enabled
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                        }`}>
                                                        {user.enabled ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                                                        <span className="text-[11px] font-bold">
                                                            {user.enabled ? t('users.enabled') : t('users.disabled')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/users/${encodeURIComponent(user.name)}/edit`}
                                                            className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                            title={t('common.edit')}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                                            title={t('common.delete')}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden grid grid-cols-1 gap-4">
                                {users.map((user, i) => (
                                    <motion.div
                                        key={user.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.05 }}
                                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 uppercase flex-shrink-0">
                                                    {user.user_image ? (
                                                        <img src={user.user_image.startsWith('http') ? user.user_image : `https://dms.salasah.sa${user.user_image}`} alt={user.full_name} className="h-full w-full object-cover rounded-xl" />
                                                    ) : (
                                                        user.full_name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-slate-900">{user.full_name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.designation || '-'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/users/${encodeURIComponent(user.name)}/edit`}
                                                    className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                    title={t('common.edit')}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('users.email')}</span>
                                                <span className="text-sm font-bold text-slate-600">{user.email}</span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('users.role')}</span>
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold border border-indigo-100">
                                                    {user.role_profile_name || '-'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{t('users.status')}</span>
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit ${user.enabled
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}>
                                                    {user.enabled ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                                                    <span className="text-[11px] font-bold">
                                                        {user.enabled ? t('users.enabled') : t('users.disabled')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-24">
                            <EmptyState title={t('users.no_users')} icon={Users} />
                        </div>
                    )}
                </div>
            </motion.div>

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('users.delete_user')}
                message={t('users.delete_confirmation')}
                isDeleting={isDeleting}
            />
        </div>
    );
}
