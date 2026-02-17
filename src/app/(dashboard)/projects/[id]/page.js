'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import {
    Calendar, MapPin, Building, Building2, UserCircle, Briefcase, FileText,
    ArrowLeft, Edit, Mail, Info, Clock, Layers, User
} from 'lucide-react';
import Link from 'next/link';

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
                </div>

                {/* Right Column - Stakeholders */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 px-1">{t('projects.stakeholders') || 'Project Team'}</h3>

                    <div className="grid grid-cols-1 gap-4">
                        <StakeholderCard
                            role={t('projects.fields.custom_project_manager') || 'Project Manager'}
                            name={project.custom_project_manager_name} // API example shows null, might use email as fallback or just email
                            email={project.custom_project_manager}
                            icon={UserCircle}
                            colorClass="bg-indigo-50 text-indigo-600"
                        />
                        <StakeholderCard
                            role={t('projects.fields.custom_consultant') || 'Consultant'}
                            name={null}
                            email={project.custom_consultant}
                            icon={Briefcase}
                            colorClass="bg-emerald-50 text-emerald-600"
                        />
                        <StakeholderCard
                            role={t('projects.fields.custom_contractor') || 'Contractor'}
                            name={null}
                            email={project.custom_contractor}
                            icon={Building}
                            colorClass="bg-amber-50 text-amber-600"
                        />
                        <StakeholderCard
                            role={t('projects.fields.custom_owner') || 'Owner'}
                            name={null}
                            email={project.custom_owner}
                            icon={User}
                            colorClass="bg-sky-50 text-sky-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
