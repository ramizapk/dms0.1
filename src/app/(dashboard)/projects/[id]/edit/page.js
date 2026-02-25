'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import {
    FolderPlus,
    Save,
    X,
    Loader2,
    Calendar,
    MapPin,
    UserCircle,
    Hash,
    Type,
    FileText,
    Building2,
    Layers,
    Home,
    Settings,
    Plus,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import PermissionGate from '@/components/auth/PermissionGate';
import WorkspaceGuard from '@/components/auth/WorkspaceGuard';

export default function EditProjectPage() {
    const { t, isRTL } = useI18n();
    const router = useRouter();
    const params = useParams(); // Get the project ID (name)
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Options
    const [projectManagers, setProjectManagers] = useState([]);
    const [contractors, setContractors] = useState([]);
    const [owners, setOwners] = useState([]);
    const [consultants, setConsultants] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);

    const disciplines = [
        { value: 'Mechanical', label: 'Mechanical' },
        { value: 'Civil', label: 'Civil' },
        { value: 'Architectural', label: 'Architectural' },
        { value: 'Electrical', label: 'Electrical' },
    ];

    // Form State
    const initialFormState = {
        name: '',
        project_name: '',
        custom_project_code: '',
        custom_project_name_en: '',
        custom_location: '',
        custom_building: '',
        custom_floor: '',
        custom_room: '',
        custom_project_manager: '',
        custom_consultant: '',
        custom_owner: '',
        custom_contractor: '',
        custom_description: '',
        expected_start_date: '',
        expected_end_date: '',
        project_numbering_settings: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [originalSettingsLength, setOriginalSettingsLength] = useState(0);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch project managers
                // Fetch Options (Parallel)
                const optionsResults = await Promise.allSettled([
                    api.getProjectManagers(),
                    api.getContractors(),
                    api.getOwners(),
                    api.getConsultants(),
                    api.getDocumentTypesList()
                ]);

                const [projectManagersRes, contractorsRes, ownersRes, consultantsRes, docTypesRes] = optionsResults;

                const processOptions = (result) => {
                    if (result.status === 'fulfilled' && result.value.message?.success && Array.isArray(result.value.message.data)) {
                        return result.value.message.data.map(item => ({
                            value: item.value,
                            label: `${item.label || item.full_name}`
                        }));
                    }
                    return [];
                };

                setProjectManagers(processOptions(projectManagersRes));
                setContractors(processOptions(contractorsRes));
                setOwners(processOptions(ownersRes));
                setConsultants(processOptions(consultantsRes));

                if (docTypesRes.status === 'fulfilled' && docTypesRes.value?.message?.success) {
                    setDocumentTypes(docTypesRes.value.message.data.map(dt => ({
                        value: dt.name,
                        label: dt.name
                    })));
                }

                // Fetch project details
                if (params.id) {
                    const projectRes = await api.getProject(decodeURIComponent(params.id));
                    if (projectRes.message && projectRes.message.success) {
                        const data = projectRes.message.data;
                        setFormData({
                            name: data.name,
                            project_name: data.project_name || '',
                            custom_project_code: data.custom_project_code || '',
                            custom_project_name_en: data.custom_project_name_en || '',
                            custom_location: data.custom_location || '',
                            custom_building: data.custom_building || '',
                            custom_floor: data.custom_floor || '',
                            custom_room: data.custom_room || '',
                            custom_project_manager: data.custom_project_manager || '',
                            custom_consultant: data.custom_consultant || '',
                            custom_owner: data.custom_owner || '',
                            custom_contractor: data.custom_contractor || '',
                            custom_description: data.custom_description || '',
                            expected_start_date: data.expected_start_date || '',
                            expected_end_date: data.expected_end_date || '',
                            project_numbering_settings: data.project_numbering_settings || []
                        });
                        setOriginalSettingsLength(data.project_numbering_settings ? data.project_numbering_settings.length : 0);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
                showToast(t('common.error'), 'error');
            } finally {
                setLoading(false);
                setLoadingOptions(false);
            }
        }
        fetchData();
    }, [params.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSettingChange = (index, field, value) => {
        // Prevent editing original settings
        if (index < originalSettingsLength) return;

        setFormData(prev => {
            const newSettings = [...prev.project_numbering_settings];
            newSettings[index] = { ...newSettings[index], [field]: value };
            return { ...prev, project_numbering_settings: newSettings };
        });
    };

    const addSetting = () => {
        setFormData(prev => ({
            ...prev,
            project_numbering_settings: [
                ...prev.project_numbering_settings,
                { document_type: '', discipline: '', start_number: 1 }
            ]
        }));
    };

    const removeSetting = (index) => {
        // Prevent removing original settings
        if (index < originalSettingsLength) return;

        setFormData(prev => {
            const newSettings = [...prev.project_numbering_settings];
            newSettings.splice(index, 1);
            return { ...prev, project_numbering_settings: newSettings };
        });
    };

    const validateSettings = () => {
        const settings = formData.project_numbering_settings;
        const seen = new Set();
        for (let i = 0; i < settings.length; i++) {
            const row = settings[i];

            // Only validate new rows for completeness
            if (i >= originalSettingsLength) {
                if (!row.document_type || !row.discipline || row.start_number === '' || row.start_number === null) {
                    showToast(isRTL ? 'يرجى إكمال كافة حقول إعدادات الطلبات.' : 'Please complete all submittal settings fields.', 'error');
                    return false;
                }
            }

            // Ensure no duplicates overall
            const key = `${row.document_type}-${row.discipline}`;
            if (seen.has(key)) {
                showToast(isRTL ? 'لا يمكن تكرار نفس النوع والتخصص في الإعدادات.' : 'Cannot duplicate the same Document Type and Discipline in settings.', 'error');
                return false;
            }
            seen.add(key);
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateSettings()) return;

        setSubmitting(true);
        setErrors({});

        try {
            const res = await api.updateProject(formData);
            if (res.message && res.message.success) {
                showToast(t('projects.success_update'), 'success');
                router.push('/projects');
            }
        } catch (err) {
            console.error('Failed to update project', err);
            showToast(err.message || t('common.error'), 'error');

            if (err.serverMessages) {
                // Handle specific server messages if needed
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to render input
    const renderInput = (name, type = 'text', icon = null, required = false) => {
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    {icon && <span className="text-indigo-400">{icon}</span>}
                    {t(`projects.fields.${name}`)}
                </label>
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all
                        ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                        }`}
                    placeholder={t(`projects.placeholders.enter_${name}`) || ''}
                />
                {errors[name] && (
                    <p className="text-xs text-red-600 font-black flex items-center gap-1 animate-in slide-in-from-top-1 pr-1">
                        <X className="w-3.5 h-3.5" />
                        {errors[name]}
                    </p>
                )}
            </div>
        );
    };

    const renderSelect = (name, options, loading, icon = null, required = false, placeholderKey) => {
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    {icon && <span className="text-indigo-400">{icon}</span>}
                    {t(`projects.fields.${name}`)}
                </label>
                <div className="relative">
                    <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        disabled={loading}
                        required={required}
                        className={`w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 transition-all appearance-none cursor-pointer ${errors[name]
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : 'focus:border-indigo-500 focus:ring-indigo-500/10'
                            }`}
                    >
                        <option value="">{t(`projects.placeholders.${placeholderKey}`) || 'Select...'}</option>
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                {errors[name] && (
                    <p className="text-xs text-red-600 font-black flex items-center gap-1 animate-in slide-in-from-top-1 pr-1">
                        <X className="w-3.5 h-3.5" />
                        {errors[name]}
                    </p>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <WorkspaceGuard workspace="المشاريع">
            <PermissionGate
                resource="Project"
                action="write"
                fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                        <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            You do not have permission to edit this project. Please contact your administrator.
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
                    <div className="relative mb-12">
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-screen h-96 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
                        <PageHeader
                            title={t('projects.edit_project')}
                            subtitle={t('projects.update_details')}
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="max-w-4xl mx-auto"
                    >
                        <form onSubmit={handleSubmit} className="premium-card p-8 sm:p-12 space-y-8">
                            <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <FolderPlus className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{t('projects.edit_project_details')}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{t('projects.fill_details')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderInput('project_name', 'text', <Type className="w-4 h-4" />, true)}
                                {renderInput('custom_project_name_en', 'text', <Type className="w-4 h-4" />, true)}

                                {renderInput('custom_project_code', 'text', <Hash className="w-4 h-4" />, true)}
                                {renderInput('custom_location', 'text', <MapPin className="w-4 h-4" />, true)}

                                {renderInput('custom_building', 'text', <Building2 className="w-4 h-4" />)}
                                {renderInput('custom_floor', 'text', <Layers className="w-4 h-4" />)}
                                {renderInput('custom_room', 'text', <Home className="w-4 h-4" />)}

                                <div className="md:col-span-2">
                                    {renderSelect('custom_project_manager', projectManagers, loadingOptions, <UserCircle className="w-4 h-4" />, true, 'select_manager')}
                                </div>

                                <div className="md:col-span-2">
                                    {renderSelect('custom_consultant', consultants, loadingOptions, <UserCircle className="w-4 h-4" />, false, 'select_consultant')}
                                </div>
                                <div className="md:col-span-2">
                                    {renderSelect('custom_owner', owners, loadingOptions, <UserCircle className="w-4 h-4" />, false, 'select_owner')}
                                </div>
                                <div className="md:col-span-2">
                                    {renderSelect('custom_contractor', contractors, loadingOptions, <UserCircle className="w-4 h-4" />, false, 'select_contractor')}
                                </div>

                                {renderInput('expected_start_date', 'date', <Calendar className="w-4 h-4" />, true)}
                                {renderInput('expected_end_date', 'date', <Calendar className="w-4 h-4" />, true)}

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-400" />
                                        {t('projects.fields.custom_description')}
                                    </label>
                                    <textarea
                                        name="custom_description"
                                        value={formData.custom_description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all resize-none"
                                        placeholder={t('projects.placeholders.enter_description')}
                                    />
                                </div>
                            </div>

                            {/* Project Settings Section */}
                            <div className="pt-6 border-t border-slate-100 mt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{t('projects.project_settings') || 'إعدادات الطلبات'}</h3>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addSetting}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {isRTL ? 'إضافة إعداد' : 'Add Setting'}
                                    </button>
                                </div>

                                {formData.project_numbering_settings.length > 0 ? (
                                    <div className="space-y-4">
                                        {formData.project_numbering_settings.map((setting, index) => {
                                            const isExistingRecord = index < originalSettingsLength;

                                            // Handle case where documentType value is setting.document_type, but display label might be matching documentTypes list
                                            // Make sure we select value properly if it's existing. If not found in documentTypes list (because API returns abbreviated value sometimes), this might need careful mapping.
                                            // For now, setting mapping logic assumes the options match existing string.

                                            return (
                                                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start bg-slate-50/50 p-4 rounded-2xl border border-slate-100 relative group transition-all hover:border-indigo-100">
                                                    <div className="sm:col-span-5 space-y-2">
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('projects.fields.document_type') || 'نوع المستند'}</label>
                                                        <select
                                                            value={setting.document_type}
                                                            onChange={(e) => handleSettingChange(index, 'document_type', e.target.value)}
                                                            required
                                                            disabled={isExistingRecord}
                                                            className={`w-full rounded-xl border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 outline-none transition-all appearance-none ${isExistingRecord ? 'opacity-70 cursor-not-allowed bg-slate-100' : 'focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/10 cursor-pointer'}`}
                                                        >
                                                            <option value="">{t('common.select') || 'Select...'}</option>
                                                            {/* If existing record and option not in list, add it temporarily so it renders correctly */}
                                                            {isExistingRecord && !documentTypes.find(dt => dt.value === setting.document_type) && (
                                                                <option value={setting.document_type}>{setting.document_type}</option>
                                                            )}
                                                            {documentTypes.map(dt => (
                                                                <option key={dt.value} value={dt.value}>{dt.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="sm:col-span-4 space-y-2">
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('projects.fields.discipline') || 'التخصص'}</label>
                                                        <select
                                                            value={setting.discipline}
                                                            onChange={(e) => handleSettingChange(index, 'discipline', e.target.value)}
                                                            required
                                                            disabled={isExistingRecord}
                                                            className={`w-full rounded-xl border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 outline-none transition-all appearance-none ${isExistingRecord ? 'opacity-70 cursor-not-allowed bg-slate-100' : 'focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/10 cursor-pointer'}`}
                                                        >
                                                            <option value="">{t('common.select') || 'Select...'}</option>
                                                            {/* If existing record and option not in list, add it temporarily so it renders correctly */}
                                                            {isExistingRecord && !disciplines.find(d => d.value === setting.discipline) && (
                                                                <option value={setting.discipline}>{setting.discipline}</option>
                                                            )}
                                                            {disciplines.map(d => (
                                                                <option key={d.value} value={d.value}>{d.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="sm:col-span-2 space-y-2">
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('projects.fields.start_number') || 'رقم البداية'}</label>
                                                        <input
                                                            type="number"
                                                            value={setting.start_number}
                                                            onChange={(e) => handleSettingChange(index, 'start_number', parseInt(e.target.value) || 0)}
                                                            required
                                                            disabled={isExistingRecord}
                                                            min="1"
                                                            className={`w-full rounded-xl border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 outline-none transition-all ${isExistingRecord ? 'opacity-70 cursor-not-allowed bg-slate-100' : 'focus:ring-4 focus:border-indigo-500 focus:ring-indigo-500/10'}`}
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-1 flex items-end justify-end h-full pt-6">
                                                        {!isExistingRecord ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSetting(index)}
                                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                                                title={t('common.delete')}
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        ) : (
                                                            <div className="p-3 shrink-0 visible h-11 pointer-events-none"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-2xl border-dashed">
                                        <p className="text-sm font-bold text-slate-400">
                                            {isRTL ? 'لا توجد إعدادات مضافة. انقر على "إضافة إعداد" للبدء.' : 'No settings added. Click "Add Setting" to begin.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 mt-8">
                                <Link
                                    href="/projects"
                                    className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {t('common.saving')}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            {t('common.confirm')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </PermissionGate>
        </WorkspaceGuard>
    );
}
