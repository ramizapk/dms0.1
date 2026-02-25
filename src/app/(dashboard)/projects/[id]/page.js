'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import {
    Calendar, MapPin, Building, Building2, UserCircle, Briefcase, FileText,
    ArrowLeft, Edit, Mail, Info, Clock, Layers, User, Home, Settings
} from 'lucide-react';
import Link from 'next/link';
import PermissionGate from '@/components/auth/PermissionGate';
import WorkspaceGuard from '@/components/auth/WorkspaceGuard';

export default function ProjectDetailsPage() {
    const { t, isRTL } = useI18n();
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProject() {
            if (!params.id) return;
            try {
                setLoading(true);
                const response = await api.getProject(params.id);
                if (response.message?.success) {
                    setProject(response.message.data);
                } else {
                    setError("Failed to load project details");
                }
            } catch (err) {
                console.error("Error fetching project:", err);
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        }
        fetchProject();
    }, [params.id]);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-12 w-64 skeleton rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-40 skeleton rounded-3xl" />
                    <div className="h-40 skeleton rounded-3xl" />
                    <div className="h-40 skeleton rounded-3xl" />
                </div>
                <div className="h-96 skeleton rounded-3xl" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
                    <Info className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{t('common.error')}</h2>
                <p className="text-slate-500 mb-8">{error || "Project not found"}</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                    {t('common.back_to_list') || 'Back'}
                </button>
            </div>
        );
    }

    const DetailCard = ({ icon: Icon, label, value, subValue, className = "" }) => (
        <div className={`p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 ${className}`}>
            <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">{label}</span>
                <p className="text-sm font-bold text-slate-900 truncate" title={value}>{value || '-'}</p>
                {subValue && <p className="text-xs text-slate-500 mt-0.5 truncate">{subValue}</p>}
            </div>
        </div>
    );

    const StakeholderCard = ({ role, name, email, icon: Icon, colorClass }) => (
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">{role}</h4>
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 truncate" title={name || email}>{name || email || '-'}</p>
                {email && name && <p className="text-xs text-slate-500 truncate flex items-center gap-1.5"><Mail className="h-3 w-3" /> {email}</p>}
            </div>
        </div>
    );

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
                            You do not have permission to view a project. Please contact your administrator.
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
                <div className="space-y-8 pb-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-4 transition-colors group"
                            >
                                <ArrowLeft className={`h-4 w-4 transition-transform ${isRTL ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                                {t('common.back_to_list') || 'Back'}
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{project.project_name}</h1>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{project.name}</span>
                                        {project.custom_project_code && (
                                            <>
                                                <span>•</span>
                                                <span>{project.custom_project_code}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={`/projects/${params.id}/edit`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95 self-start md:self-auto"
                        >
                            <Edit className="h-4 w-4" />
                            {t('common.edit') || 'Edit'}
                        </Link>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Key Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DetailCard
                                    icon={MapPin}
                                    label={t('projects.fields.custom_location') || 'Location'}
                                    value={project.custom_location}
                                />
                                <DetailCard
                                    icon={Layers}
                                    label={t('projects.fields.custom_project_name_en') || 'English Name'}
                                    value={project.custom_project_name_en}
                                />
                                <DetailCard
                                    icon={Calendar}
                                    label={t('projects.fields.expected_start_date') || 'Start Date'}
                                    value={project.expected_start_date}
                                />
                                <DetailCard
                                    icon={Clock}
                                    label={t('projects.fields.expected_end_date') || 'End Date'}
                                    value={project.expected_end_date}
                                />
                                <DetailCard
                                    icon={Building2}
                                    label={t('projects.fields.custom_building') || 'Building'}
                                    value={project.custom_building}
                                />
                                <DetailCard
                                    icon={Layers}
                                    label={t('projects.fields.custom_floor') || 'Floor'}
                                    value={project.custom_floor}
                                />
                                <DetailCard
                                    icon={Home}
                                    label={t('projects.fields.custom_room') || 'Room'}
                                    value={project.custom_room}
                                />
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-indigo-500" />
                                    {t('projects.fields.custom_description') || 'Description'}
                                </h3>
                                <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed">
                                    {project.custom_description ? (
                                        <p>{project.custom_description}</p>
                                    ) : (
                                        <p className="text-slate-400 italic">{t('common.not_specified') || 'Not specified'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Project Settings Table */}
                            {project.project_numbering_settings && project.project_numbering_settings.length > 0 && (
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col gap-4">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-indigo-500" />
                                        {t('projects.project_settings') || 'إعدادات المشروع'}
                                    </h3>
                                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                                        <table className="w-full text-sm text-start">
                                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-center w-16">#</th>

                                                    <th className="px-4 py-3">{t('projects.fields.document_type') || 'نوع المستند'}</th>
                                                    <th className="px-4 py-3">{t('projects.fields.discipline') || 'التخصص'}</th>
                                                    <th className="px-4 py-3 text-center">{t('projects.fields.start_number') || 'رقم البداية'}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                                {project.project_numbering_settings.map((setting, index) => (
                                                    <tr key={setting.name || index} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-center text-slate-400 font-medium">{index + 1}</td>

                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                                                {setting.document_type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                                                                {setting.discipline}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-bold text-slate-700 bg-slate-50/50">{setting.start_number}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Stakeholders */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 px-1">{t('projects.stakeholders') || 'Project Team'}</h3>

                            <div className="grid grid-cols-1 gap-4">
                                <StakeholderCard
                                    role={t('projects.fields.custom_project_manager') || 'Project Manager'}
                                    name={project.custom_project_manager_name} // API example shows null, might use email as fallback or just email
                                    email={null}
                                    icon={UserCircle}
                                    colorClass="bg-indigo-50 text-indigo-600"
                                />
                                <StakeholderCard
                                    role={t('projects.fields.custom_consultant') || 'Consultant'}
                                    name={project.custom_consultant_name}
                                    email={null}
                                    icon={Briefcase}
                                    colorClass="bg-emerald-50 text-emerald-600"
                                />
                                <StakeholderCard
                                    role={t('projects.fields.custom_contractor') || 'Contractor'}
                                    name={project.custom_contractor_name}
                                    email={null}
                                    icon={Building}
                                    colorClass="bg-amber-50 text-amber-600"
                                />
                                <StakeholderCard
                                    role={t('projects.fields.custom_owner') || 'Owner'}
                                    name={project.custom_owner_name}
                                    email={null}
                                    icon={User}
                                    colorClass="bg-sky-50 text-sky-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </PermissionGate>
        </WorkspaceGuard>
    );
}
