'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import { FileText, Calendar, Building2, UserCircle, Printer, Download, Clock, CheckCircle2, History, Paperclip, XCircle, Gavel, Loader2, X, FileImage, File } from 'lucide-react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import FileUpload from '@/components/ui/FileUpload';
import { useToast } from '@/context/ToastContext';
import RichTextDisplay from '@/components/ui/RichTextDisplay';

// Portal component for modal
const Portal = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    return mounted ? createPortal(children, document.body) : null;
};

export default function DocumentDetailsPage() {
    const { t, isRTL } = useI18n();
    const params = useParams();
    const { showToast } = useToast();
    const [doc, setDoc] = useState(null);
    const [history, setHistory] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const docName = decodeURIComponent(params.id);

                // Fetch document details
                const docRes = await api.getDocument(docName);
                const documentData = docRes.message.data;
                setDoc(documentData);

                // Fetch workflow history
                const historyRes = await api.getWorkflowHistory('Masar Document', docName);

                if (historyRes.message && historyRes.message.success) {
                    setHistory(historyRes.message.data.history || []);
                }

                // Fetch files
                const filesRes = await api.getFiles(docName);
                if (filesRes.data) {
                    setFiles(filesRes.data);
                }

            } catch (err) {
                console.error('Failed to fetch document details', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    // Action & UI states
    const [availableActions, setAvailableActions] = useState([]);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const [consultantEngineers, setConsultantEngineers] = useState([]);
    const [selectedEngineer, setSelectedEngineer] = useState(null);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);

    const handleAttachmentComplete = async () => {
        setIsAttachmentModalOpen(false);
        showToast(t('documents.success_update'), 'success');

        try {
            const filesRes = await api.getFiles(doc.name);
            if (filesRes.data) {
                setFiles(filesRes.data);
            }
        } catch (err) {
            console.error("Failed to refresh files", err);
        }
    };

    // Fetch Actions
    const handleOpenActions = async () => {
        try {
            setActionLoading(true);
            const res = await api.getAvailableActions("Masar Document", doc.name);
            if (res.message && res.message.success) {
                const actions = res.message.data.actions || [];
                if (actions.length > 0) {
                    setAvailableActions(actions);
                    setIsActionModalOpen(true);
                } else {
                    showToast(t('documents.no_actions'), 'error');
                }
            } else {
                showToast(res.message?.message || t('documents.no_actions'), 'error');
            }
        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Apply Action
    const handleApplyAction = async (actionName, isConfirmed = false) => {
        const isConsultantRouting = doc.workflow_state === 'Consultant Document Officer – Technical Routing – Consultant';
        const needsEngineer = isConsultantRouting && (actionName === 'Approve' || actionName === 'Approve With Notes');

        // 1. Intercept for Engineer Selection (or just Notes)
        if ((needsEngineer || actionName === 'Approve With Notes') && !isConfirmed) {
            setPendingAction(actionName);
            setNotes(''); // Clear previous notes

            // Fetch engineers if needed for the specific state
            if (needsEngineer && consultantEngineers.length === 0) {
                try {
                    setActionLoading(true);
                    const res = await api.getUsersByDiscipline('Masar Document', doc.name);
                    if (res.message && res.message.success) {
                        const users = res.message.data.users || [];
                        setConsultantEngineers(users);
                        if (users.length > 0) {
                            setSelectedEngineer(users[0].email);
                        }
                    }
                } catch (err) {
                    console.error("Failed to load engineers", err);
                    showToast("Failed to load engineer list", "error");
                } finally {
                    setActionLoading(false);
                }
            }
            return;
        }

        // 2. Validation before submission
        if (needsEngineer && !selectedEngineer) {
            showToast(t('documents.select_engineer_required') || "Please select a specialist engineer", 'error');
            return;
        }

        try {
            setActionLoading(true);
            const payload = {
                doctype: "Masar Document",
                name: doc.name,
                action: actionName
            };

            // Add notes if applicable (always send notes if it was 'Approve With Notes' action, even if empty string if allowed)
            if (actionName === 'Approve With Notes') {
                payload.notes = notes;
            }

            // Add engineer if applicable
            if (needsEngineer) {
                payload.consultant_specialist_engineer_reviewer = selectedEngineer;
            }

            const res = await api.applyAction(payload);

            if (res.message && res.message.success) {
                showToast(t('documents.action_success'), 'success');
                setIsActionModalOpen(false);
                setPendingAction(null);
                setNotes('');
                setSelectedEngineer(null);

                // Re-fetch all document data to fully refresh the page
                try {
                    const docName = doc.name;

                    // Fetch updated document details (includes workflow_state, workflow_states_status, permissions, etc.)
                    const docRes = await api.getDocument(docName);
                    if (docRes.message && docRes.message.data) {
                        setDoc(docRes.message.data);
                    }

                    // Refresh workflow history to show the new action
                    const historyRes = await api.getWorkflowHistory('Masar Document', docName);
                    if (historyRes.message && historyRes.message.success) {
                        setHistory(historyRes.message.data.history || []);
                    }

                    // Refresh files list
                    const filesRes = await api.getFiles(docName);
                    if (filesRes.data) {
                        setFiles(filesRes.data);
                    }
                } catch (refreshErr) {
                    console.error('Failed to refresh document data after action', refreshErr);
                }
            } else {
                showToast(res.message?.message || 'Failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };


    if (loading) return <LoadingSkeleton type="cards" />; // Simple skeleton fallback
    if (error) return (
        <div className="flex flex-col items-center justify-center h-96">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <div className="text-xl font-bold text-slate-800">{t('common.error')}</div>
            <div className="text-slate-500">{error}</div>
        </div>
    );
    if (!doc) return null;

    // Helper to find state status
    const currentWorkflowState = doc.workflow_state;

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(isRTL ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Workflow state translation map (English -> Arabic)
    const workflowStateTranslations = {
        'Draft – Contractor Specialist Engineer': 'مسودة – مهندس المقاول المختص',
        'Contractor Project Manager – Contractor': 'مدير مشروع المقاول – المقاول',
        'Contractor Document Officer – After PM Approval – Contractor': 'مسؤول وثائق المقاول – بعد موافقة المدير – المقاول',
        'Consultant Document Officer – Technical Routing – Consultant': 'مسؤول وثائق الاستشاري – التوجيه الفني – الاستشاري',
        'Consultant Specialist Engineer – Consultant': 'المهندس المختص – الاستشاري',
        'Consultant Project Manager – Consultant': 'مدير مشروع الاستشاري – الاستشاري',
        'Owner': 'المالك',
        'Final Approval': 'الموافقة النهائية',
    };

    // Helper to translate a workflow state string
    const translateState = (stateStr) => {
        if (!stateStr) return '';
        if (isRTL) {
            // Arabic: try exact match first, then partial match
            if (workflowStateTranslations[stateStr]) return workflowStateTranslations[stateStr];
            const key = Object.keys(workflowStateTranslations).find(k => stateStr.includes(k) || k.includes(stateStr));
            return key ? workflowStateTranslations[key] : stateStr;
        }
        return stateStr; // English: return as-is
    };

    // Helper to find specific history entries based on role or state keywords
    const findHistoryEntry = (keywords) => {
        // Search in reverse to find the latest action
        return [...history].reverse().find(h => {
            const stateMatch = h.state && keywords.some(k => h.state.includes(k));
            const roleMatch = h.role_profile && keywords.some(k => h.role_profile.includes(k));
            return stateMatch || roleMatch;
        });
    };

    // Derived Data from History
    const preparedBy = history.length > 0 ? history[0] : null; // First entry = document creator (Contractor Specialist)
    const submittedBy = findHistoryEntry(['Contractor Project Manager', 'Contractor Document Officer']); // PM or DO step
    const inspectedBy = findHistoryEntry(['Consultant Specialist', 'Consultant Document Officer', 'Technical Routing']); // Consultant review
    // approvedBy: last entry whose next_state contains Consultant Project Manager (or Owner)
    const approvedBy = history.length > 0
        ? ([...history].reverse().find(h =>
            (h.state && (h.state.includes('Consultant Project Manager') || h.state.includes('Owner') || h.state.includes('Final Approval'))) ||
            (h.next_state && (h.next_state.includes('Consultant Project Manager') || h.next_state.includes('Owner') || h.next_state.includes('Final Approval')))
        ) || history[history.length - 1]) // fallback to last entry
        : null;

    // Filter comments from Consultants or Owners
    const consultantComments = history.filter(h =>
        (h.role_profile?.includes('Consultant') || h.state?.includes('Consultant') || h.role_profile?.includes('Owner')) &&
        h.notes
    );

    // ── Approval Code ──────────────────────────────────────────────────────────
    // Derived from the action taken at "Consultant Specialist Engineer" step
    const consultantSpecialistStep = doc.workflow_states_status?.steps?.find(
        s => s.state?.includes('Consultant Specialist Engineer')
    );
    const actionToApprovalCode = (action) => {
        if (!action) return null;
        const a = action.trim();
        if (a === 'Approve') return 'A- Approved';
        if (a === 'Approve With Notes') return 'B- Approved with Comments';
        if (a === 'Revise & Resubmit') return 'C- Revised & Resubmit';
        if (a === 'Reject') return 'D- Rejected';
        if (a === 'For Information') return 'F- For Information';
        return a; // fallback: show the action as-is
    };
    const computedApprovalCode = consultantSpecialistStep?.action_taken
        ? actionToApprovalCode(consultantSpecialistStep.action_taken)
        : (doc.approval_code || null);
    // ───────────────────────────────────────────────────────────────────────────


    return (
        <div className="space-y-6 pb-20 relative">
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 5mm;
                    }

                    /* Global Layout Reset - vital for sidebar independence */
                    html, body, main, .dashboard-content {
                        margin: 0 !important;
                        padding: 0 !important;
                        border: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        overflow: visible !important;
                        position: static !important; /* Override sticky/fixed positioning */
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Reset visibility for everything */
                    body * {
                        visibility: hidden;
                    }

                    /* Make printable content visible */
                    #printable-document,
                    #printable-document * {
                        visibility: visible !important;
                    }

                    #printable-document {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        border: 1px solid black !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        overflow: visible !important;
                        height: auto !important;
                        color: black !important;
                        font-family: 'Times New Roman', serif !important; /* Professional font for print */
                    }

                    /* Force Grid layouts */
                    #printable-document .grid {
                        display: grid !important;
                    }

                    #printable-document .grid-cols-3 {
                        grid-template-columns: repeat(3, 1fr) !important;
                    }

                    #printable-document .grid-cols-2 {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }

                    #printable-document .gap-8 {
                        gap: 0 !important;
                    }

                    /* reduce internal spacing */
                    #printable-document .p-6 {
                        padding: 4mm !important;
                    }
                    
                    #printable-document .p-4 {
                        padding: 3mm !important;
                    }
                    
                    #printable-document .p-2 {
                        padding: 1.5mm !important;
                    }
                    
                    #printable-document .space-y-6 > * + * {
                        margin-top: 2mm !important;
                    }
                    
                    #printable-document .space-y-4 > * + * {
                        margin-top: 2mm !important;
                    }

                    /* Adjust Heights */
                    #printable-document .min-h-\[160px\] {
                        min-height: 20mm !important;
                    }
                    
                    #printable-document .min-h-\[120px\] {
                        min-height: 15mm !important;
                    }
                    
                    #printable-document .min-h-\[100px\] {
                         min-height: 15mm !important;
                    }
                     
                    #printable-document .h-16 {
                        height: 12mm !important;
                    }
                    
                     #printable-document .h-12 {
                        height: 10mm !important;
                    }

                    /* Typography */
                    #printable-document h1 {
                        font-size: 16pt !important;
                        margin-bottom: 2mm !important;
                        color: black !important; /* Force black title or keep red if strictly needed? User asked for professional */
                    }
                    
                    #printable-document .text-2xl,
                    #printable-document .text-3xl {
                        font-size: 14pt !important;
                    }

                    #printable-document .text-lg,
                    #printable-document .text-xl {
                        font-size: 12pt !important;
                    }
                    
                    #printable-document .text-sm,
                    #printable-document .text-base {
                        font-size: 10pt !important;
                    }
                    
                    #printable-document .text-xs,
                    #printable-document .text-\[10px\],
                    #printable-document .text-\[9px\] {
                         font-size: 9pt !important;
                    }

                    /* Colors & Borders */
                    #printable-document .bg-slate-50,
                    #printable-document .bg-indigo-50,
                    #printable-document .bg-indigo-50\/50 {
                        background-color: #f0f0f0 !important; /* Light gray for print */
                        print-color-adjust: exact !important;
                    }

                    #printable-document .border-indigo-900,
                    #printable-document .border-slate-200 {
                        border-color: black !important;
                        border-width: 1px !important;
                    }

                     /* Signatures & Stamps */
                    #printable-document .font-dancing-script {
                        font-family: cursive !important;
                        color: #000 !important;
                    }
                    
                    /* Hide scrollbars */
                    ::-webkit-scrollbar {
                        display: none;
                    }
                }
            `}</style>



            {/* Header / Title Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {/* Can add breadcrumbs or title here if needed */}
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                    {/* Action Button */}
                    {doc.has_workflow_action_permission === 1 && (
                        <button
                            onClick={handleOpenActions}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gavel className="w-5 h-5" />}
                            {t('documents.action_title')}
                        </button>
                    )}

                    {/* Add Attachments Button */}
                    {doc.has_workflow_action_permission === 1 && (
                        <button
                            onClick={() => setIsAttachmentModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm transition-all active:scale-95"
                        >
                            <Paperclip className="w-5 h-5" />
                            {t('documents.add_attachments')}
                        </button>
                    )}

                    {/* Print Button */}
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm transition-all active:scale-95"
                    >
                        <Printer className="w-5 h-5" />
                        {t('documents.print_document')}
                    </button>
                </div>
            </div>

            {/* Action Modal */}
            <AnimatePresence>
                {isActionModalOpen && (
                    <Portal>
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                onClick={() => {
                                    setIsActionModalOpen(false);
                                    setPendingAction(null);
                                    setNotes('');
                                }}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative z-10 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <button
                                        onClick={() => {
                                            setIsActionModalOpen(false);
                                            setPendingAction(null);
                                            setNotes('');
                                            setSelectedEngineer(null);
                                        }}
                                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {pendingAction ? (
                                    // Confirmation / Input View (Notes + Engineer)
                                    <div className="pt-2">
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">{t(`documents.action_${pendingAction.toLowerCase().replace(/ /g, '_')}`) || pendingAction}</h3>
                                            <p className="text-slate-500 text-sm mt-2">{t('documents.confirm_action_details')}</p>
                                        </div>

                                        {/* Engineer Selection Dropdown - Only for specific state & action */}
                                        {doc.workflow_state === 'Consultant Document Officer – Technical Routing – Consultant' &&
                                            (pendingAction === 'Approve' || pendingAction === 'Approve With Notes') && (
                                                <div className="mb-4">
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                                        {t('documents.select_specialist_engineer') || "Select Specialist Engineer"} <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            value={selectedEngineer || ''}
                                                            onChange={(e) => setSelectedEngineer(e.target.value)}
                                                            className="w-full py-3 px-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none text-sm bg-white text-ellipsis overflow-hidden"
                                                        >
                                                            {consultantEngineers.map((eng) => (
                                                                <option key={eng.email} value={eng.email}>
                                                                    {eng.full_name} ({eng.email})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <UserCircle className="absolute right-4 rtl:left-4 rtl:right-auto top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                            )}

                                        {/* Notes Input - Only for 'Approve With Notes' (or others if we expand) */}
                                        {pendingAction === 'Approve With Notes' && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    {t('documents.notes') || "Notes"} <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                                                    placeholder={t('documents.notes_placeholder')}
                                                />
                                            </div>
                                        )}

                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => {
                                                    setPendingAction(null);
                                                    setSelectedEngineer(null);
                                                    setNotes('');
                                                }}
                                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                            <button
                                                onClick={() => handleApplyAction(pendingAction, true)}
                                                disabled={
                                                    actionLoading ||
                                                    (pendingAction === 'Approve With Notes' && !notes.trim()) ||
                                                    (doc.workflow_state === 'Consultant Document Officer – Technical Routing – Consultant' &&
                                                        (pendingAction === 'Approve' || pendingAction === 'Approve With Notes') &&
                                                        !selectedEngineer)
                                                }
                                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                                {t('common.confirm')}
                                            </button>
                                        </div>
                                    </div>

                                ) : (
                                    // Action Selection View
                                    <>
                                        <div className="text-center mb-8 pt-2">
                                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                                <Gavel className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">{t('documents.available_actions')}</h3>
                                            <p className="text-slate-500 text-sm mt-2">{t('documents.select_action')}</p>
                                        </div>

                                        <div className="space-y-3">
                                            {availableActions.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleApplyAction(action.action)}
                                                    disabled={actionLoading}
                                                    className={`w-full p-4 rounded-xl border-2 font-bold flex items-center justify-between group transition-all
                                                    ${action.action === 'Reject'
                                                            ? 'border-rose-100 bg-rose-50/50 hover:bg-rose-100 hover:border-rose-200 text-rose-700'
                                                            : action.action === 'Approve'
                                                                ? 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-200 text-emerald-700'
                                                                : 'border-slate-100 hover:bg-slate-50 hover:border-indigo-200 text-slate-700'
                                                        }
                                                `}
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <span className={`w-2 h-2 rounded-full ${action.action === 'Reject' ? 'bg-rose-500' : action.action === 'Approve' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
                                                        {isRTL ? action.action_ar : action.action}
                                                    </span>
                                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : (
                                                        <span className="text-xs font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                                                            {t('common.next')}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </Portal>
                )}
            </AnimatePresence>

            {/* Attachment Modal */}
            <AnimatePresence>
                {isAttachmentModalOpen && (
                    <Portal>
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                onClick={() => setIsAttachmentModalOpen(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Paperclip className="w-5 h-5" />
                                        </div>
                                        {t('documents.upload_modal_title')}
                                    </h3>
                                    <button
                                        onClick={() => setIsAttachmentModalOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-8">
                                    <FileUpload
                                        docName={doc.name}
                                        onAllUploadsComplete={handleAttachmentComplete}
                                        multiple={true}
                                        className="w-full"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </Portal>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Document View - Left/Center Column (2/3 width) */}
                <div className="xl:col-span-2 space-y-6">

                    {/* The "Paper" */}
                    <motion.div
                        id="printable-document"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-none shadow-lg border-2 border-indigo-900 overflow-hidden relative"
                    >
                        {/* Header Section with Red Title */}
                        <div className="bg-white border-b-2 border-indigo-900 p-6 text-center">
                            <h1 className="text-2xl md:text-3xl font-black text-rose-500 uppercase tracking-wide">
                                {t('documents.submittal_title')} ({doc.name})
                            </h1>
                        </div>

                        {/* Logos Section */}
                        <div className="grid grid-cols-3 divide-x-2 divide-indigo-900 border-b-2 border-indigo-900 rtl:divide-x-reverse">
                            {/* Consultant */}
                            <div className="p-4 text-center space-y-2">
                                {/* Logo */}
                                <div className="h-16 flex items-center justify-center">
                                    {doc.consultant_user_image_url ? (
                                        <img src={doc.consultant_user_image_url} alt="Consultant Logo" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <div className="text-xs text-slate-400 italic">No Logo</div>
                                    )}
                                </div>
                                <div className="text-sm font-bold text-indigo-900 uppercase">{t('documents.custom_consultant')}</div>
                            </div>
                            {/* Owner */}
                            <div className="p-4 text-center space-y-2">
                                <div className="h-16 flex items-center justify-center">
                                    {doc.owner_user_image_url ? (
                                        <img src={doc.owner_user_image_url} alt="Owner Logo" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <div className="text-xs text-slate-400 italic">No Logo</div>
                                    )}
                                </div>
                                <div className="text-sm font-bold text-indigo-900 uppercase">{t('documents.custom_owner')}</div>
                            </div>
                            {/* Contractor */}
                            <div className="p-4 text-center space-y-2">
                                <div className="h-16 flex items-center justify-center">
                                    {doc.contractor_user_image_url ? (
                                        <img src={doc.contractor_user_image_url} alt="Contractor Logo" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <div className="text-xs text-slate-400 italic">No Logo</div>
                                    )}
                                </div>
                                <div className="text-sm font-bold text-indigo-900 uppercase">{t('documents.custom_contractor')}</div>
                            </div>
                        </div>

                        {/* Company Names Row */}
                        <div className="grid grid-cols-3 divide-x-2 divide-indigo-900 border-b-2 border-indigo-900 bg-slate-50 rtl:divide-x-reverse text-xs font-bold text-slate-700">
                            <div className="p-2 text-center">{doc?.custom_consultant_name || t('common.not_specified')}</div>
                            <div className="p-2 text-center">{doc?.custom_owner_name || t('common.not_specified')}</div>
                            <div className="p-2 text-center">{doc?.custom_contractor_name || t('common.not_specified')}</div>
                        </div>

                        {/* Project Details Grid */}
                        <div className="grid grid-cols-2 text-sm">
                            {/* Left Column */}
                            <div className="border-r-2 border-indigo-900 rtl:border-l-2 rtl:border-r-0">
                                <div className="flex border-b border-slate-200">
                                    <div className="w-1/3 p-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50 border-r border-slate-200 rtl:border-l rtl:border-r-0 flex items-center">{t('projects.project_name')}</div>
                                    <div className="w-2/3 p-2 font-bold text-slate-800">{doc.project_name} - {t('documents.project_title_placeholder')}</div>
                                </div>
                                <div className="flex border-b border-slate-200">
                                    <div className="w-1/3 p-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50 border-r border-slate-200 rtl:border-l rtl:border-r-0 flex items-center">{t('documents.request_for')}</div>
                                    <div className="w-2/3 p-2 font-bold text-slate-800">{doc.submittal_type}</div>
                                </div>
                                <div className="flex border-b border-slate-200">
                                    <div className="w-1/3 p-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50 border-r border-slate-200 rtl:border-l rtl:border-r-0 flex items-center">{t('documents.discipline')}</div>
                                    <div className="w-2/3 p-2 font-bold text-slate-800">{doc.discipline}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-1/3 p-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50 border-r border-slate-200 rtl:border-l rtl:border-r-0 flex items-center">{t('documents.building')}</div>
                                    <div className="w-2/3 p-2 font-bold text-slate-800">{doc.building_name || '-'}</div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <div className="flex border-b border-slate-200">
                                    <div className="w-1/3 p-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50 border-r border-slate-200 rtl:border-l rtl:border-r-0 flex items-center">{t('documents.contract_no')}</div>
                                    <div className="w-2/3 p-2 font-bold text-slate-800">1-2024-T</div>
                                </div>
                                <div className="flex border-b border-slate-200">
                                    <div className="w-1/3 p-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50 border-r border-slate-200 rtl:border-l rtl:border-r-0 flex items-center">{t('documents.date')}</div>
                                    <div className="w-2/3 p-2 font-bold text-slate-800">{formatDate(doc.creation)}</div>
                                </div>
                                <div className="flex border-b border-slate-200">
                                    <div className="w-1/3 p-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50 border-r border-slate-200 rtl:border-l rtl:border-r-0 flex items-center">{t('documents.floor')}</div>
                                    <div className="w-2/3 p-2 font-bold text-slate-800">{doc.floor || '-'}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-1/3 p-2 font-bold text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50 border-r border-slate-200 rtl:border-l rtl:border-r-0 flex items-center">{t('documents.room')}</div>
                                    <div className="w-2/3 p-2 font-bold text-slate-800">-</div>
                                </div>
                            </div>
                        </div>

                        {/* Work Description */}
                        <div className="border-y-2 border-indigo-900">
                            <div className="bg-slate-50 p-2 border-b border-slate-200 font-bold text-slate-900 uppercase text-xs tracking-wider">
                                {t('documents.work_description')}:
                            </div>
                            <div className="p-4 min-h-[160px]">
                                <RichTextDisplay content={doc.description} />
                            </div>
                        </div>
                        {/* Signatures Outer Container: Top Section – Contractors Remarks */}
                        <div className="border border-indigo-900 bg-white mb-0 flex flex-col">
                            {/* Contractors Remarks Header */}
                            <div className="p-2 border-b border-indigo-900 font-bold text-indigo-900 text-[10px]">
                                {t('documents.contractors_remarks') || 'Contractors Remarks:'}
                            </div>

                            {/* Empty space for remarks */}
                            <div className="min-h-[60px]"></div>

                            {/* Top 3 Columns Row */}
                            <div className="grid grid-cols-3 border-t border-indigo-900 min-h-[160px]">

                                {/* Col 1: PREPARED BY */}
                                <div className="p-3 flex flex-col border-r border-indigo-900 rtl:border-r-0 rtl:border-l rtl:border-indigo-900">
                                    <div className="font-bold uppercase text-indigo-900 text-[10px] border-b border-slate-200 pb-1 mb-2">
                                        {t('documents.prepared_by') || 'PREPARED BY'}:
                                    </div>
                                    <div className="text-slate-700 text-[10px] mb-2">
                                        {preparedBy?.role_profile || ''}
                                    </div>
                                    {/* Signature Image */}
                                    <div className="flex-1 flex items-center justify-center my-2">
                                        {preparedBy?.digital_signature
                                            ? <img src={`https://app.dms.salasah.sa${preparedBy.digital_signature}`} className="h-14 max-w-full object-contain" alt="Signature" />
                                            : <div className="h-14" />
                                        }
                                    </div>
                                    {/* Name at bottom */}
                                    <div className="text-slate-900 font-bold text-[10px] text-center border-t border-slate-200 pt-1 mt-1">
                                        {preparedBy ? (preparedBy.user_full_name || preparedBy.user) : ''}
                                    </div>
                                </div>

                                {/* Col 2: SIGN & STAMP */}
                                <div className="p-3 flex flex-col border-r border-indigo-900 rtl:border-r-0 rtl:border-l rtl:border-indigo-900">
                                    <div className="font-bold uppercase text-indigo-900 text-[10px] border-b border-slate-200 pb-1 mb-2 text-center">
                                        {t('documents.sign_stamp') || 'SIGN & STAMP'}:
                                    </div>
                                    {/* Stamp Image centered */}
                                    <div className="flex-1 flex items-center justify-center">
                                        {preparedBy?.digital_stamp
                                            ? <img src={`https://app.dms.salasah.sa${preparedBy.digital_stamp}`} className="h-20 max-w-full object-contain" alt="Stamp" />
                                            : <div className="h-20" />
                                        }
                                    </div>
                                </div>

                                {/* Col 3: SUBMITTED BY */}
                                <div className="p-3 flex flex-col mb-0">
                                    <div className="font-bold uppercase text-indigo-900 text-[10px] border-b border-slate-200 pb-1 mb-2">
                                        {t('documents.submitted_by') || 'SUBMITTED BY'}:
                                    </div>
                                    <div className="text-slate-700 text-[10px] mb-2">
                                        {submittedBy?.role_profile || ''}
                                    </div>
                                    {/* Signature Image */}
                                    <div className="flex-1 flex items-center justify-center my-2">
                                        {submittedBy?.digital_signature
                                            ? <img src={`https://app.dms.salasah.sa${submittedBy.digital_signature}`} className="h-14 max-w-full object-contain" alt="Signature" />
                                            : <div className="h-14" />
                                        }
                                    </div>
                                    {/* Name at bottom */}
                                    <div className="text-slate-900 font-bold text-[10px] text-center border-t border-slate-200 pt-1 mt-1">
                                        {submittedBy ? (submittedBy.user_full_name || submittedBy.user) : ''}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Signatures Outer Container: Bottom Section – Client/Consultants */}
                        <div className="border  mt-0 border-indigo-900 bg-white flex flex-col">
                            {/* Client Comments Header */}
                            <div className="p-2 border-b border-indigo-900 font-bold uppercase text-indigo-900 text-[10px]">
                                {t('documents.client_comments') || 'CLIENT/CONSULTANTS COMMENTS:'}
                            </div>
                            <div className="min-h-[60px]"></div>
                            {/* Comments Content – compact, only shown when there is content */}
                            {(doc.notes || consultantComments.length > 0) && (
                                <div className="p-2 text-slate-700 text-[10px] ">
                                    {doc.notes ? (
                                        <div className="whitespace-pre-wrap">{doc.notes}</div>
                                    ) : (
                                        <div className="space-y-1">
                                            {consultantComments.map((comment, idx) => (
                                                <div key={idx}>
                                                    <span className="font-bold text-indigo-900">{comment.user_full_name || comment.user}: </span>
                                                    <span>{comment.notes}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Approval Codes Row */}
                            <div className="flex flex-row border-t border-indigo-900 divide-x divide-indigo-900 rtl:divide-x-reverse font-bold text-[10px]">
                                <div className="p-2 flex items-center justify-center text-slate-700 whitespace-nowrap">
                                    {t('documents.approval_codes') || 'Approval Codes'}:
                                </div>
                                <div className={`flex-1 p-2 flex items-center justify-start px-4 uppercase tracking-wider font-black
                                    ${computedApprovalCode?.startsWith('A') ? 'text-emerald-600' :
                                        computedApprovalCode?.startsWith('B') ? 'text-blue-600' :
                                            computedApprovalCode?.startsWith('C') ? 'text-amber-600' :
                                                computedApprovalCode?.startsWith('D') ? 'text-rose-600' :
                                                    computedApprovalCode?.startsWith('F') ? 'text-slate-600' :
                                                        'text-indigo-600'}`}>
                                    {computedApprovalCode || '-'}
                                </div>
                            </div>

                            {/* Signatures Bottom Row */}
                            <div className="grid grid-cols-3 border-t border-indigo-900 min-h-[160px]">

                                {/* Col 1: INSPECTED BY */}
                                <div className="p-3 flex flex-col border-r border-indigo-900 rtl:border-r-0 rtl:border-l rtl:border-indigo-900">
                                    <div className="font-bold uppercase text-indigo-900 text-[10px] border-b border-slate-200 pb-1 mb-2">
                                        {t('documents.inspected_by') || 'Inspected By'}:
                                    </div>
                                    <div className="text-slate-700 text-[10px] mb-2">
                                        {inspectedBy?.role_profile || ''}
                                    </div>
                                    {/* Signature Image */}
                                    <div className="flex-1 flex items-center justify-center my-2">
                                        {inspectedBy?.digital_signature
                                            ? <img src={`https://app.dms.salasah.sa${inspectedBy.digital_signature}`} className="h-14 max-w-full object-contain" alt="Signature" />
                                            : <div className="h-14" />
                                        }
                                    </div>
                                    {/* Name at bottom */}
                                    <div className="text-slate-900 font-bold text-[10px] text-center border-t border-slate-200 pt-1 mt-1">
                                        {inspectedBy ? (inspectedBy.user_full_name || inspectedBy.user) : ''}
                                    </div>
                                </div>

                                {/* Col 2: SIGN & STAMP */}
                                <div className="p-3 flex flex-col border-r border-indigo-900 rtl:border-r-0 rtl:border-l rtl:border-indigo-900">
                                    <div className="font-bold uppercase text-indigo-900 text-[10px] border-b border-slate-200 pb-1 mb-2 text-center">
                                        {t('documents.sign_stamp') || 'SIGN & STAMP'}:
                                    </div>
                                    {/* Stamp Image centered */}
                                    <div className="flex-1 flex items-center justify-center">
                                        {inspectedBy?.digital_stamp
                                            ? <img src={`https://app.dms.salasah.sa${inspectedBy.digital_stamp}`} className="h-20 max-w-full object-contain" alt="Stamp" />
                                            : <div className="h-20" />
                                        }
                                    </div>
                                </div>

                                {/* Col 3: APPROVED BY */}
                                <div className="p-3 flex flex-col">
                                    <div className="font-bold uppercase text-indigo-900 text-[10px] border-b border-slate-200 pb-1 mb-2">
                                        {t('documents.approved_by') || 'Approved By'}:
                                    </div>
                                    <div className="text-slate-700 text-[10px] mb-2">
                                        {approvedBy?.role_profile || ''}
                                    </div>
                                    {/* Signature Image */}
                                    <div className="flex-1 flex items-center justify-center my-2">
                                        {approvedBy?.digital_signature
                                            ? <img src={`https://app.dms.salasah.sa${approvedBy.digital_signature}`} className="h-14 max-w-full object-contain" alt="Signature" />
                                            : <div className="h-14" />
                                        }
                                    </div>
                                    {/* Name at bottom */}
                                    <div className="text-slate-900 font-bold text-[10px] text-center border-t border-slate-200 pt-1 mt-1">
                                        {approvedBy ? (approvedBy.user_full_name || approvedBy.user) : ''}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="bg-slate-50 p-2 border-t-2 border-indigo-900 flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <div>{t('documents.closed_at')}: {formatDate(doc.modified)}</div>
                            <div>{t('documents.attachments')}: {files.length}</div>
                        </div>

                    </motion.div>
                </div>

                {/* Sidebar - Right Column (1/3 width) */}
                <div className="space-y-6">
                    {/* Order Time */}
                    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-indigo-900 mb-1">{t('documents.order_time')}</h3>
                        <div className="text-lg font-black text-slate-700">{doc.order_time || '-'}</div>
                    </div>

                    {/* Order Status (Stepper) */}
                    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 z-0" />
                        <h3 className="text-lg font-black text-indigo-900 mb-6 relative z-10 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                            {t('documents.order_status')}
                        </h3>

                        <div className="space-y-0 relative z-10">
                            {/* Simplified Vertical Stepper */}
                            <div className="absolute left-3 top-2 bottom-4 w-0.5 bg-slate-200 rtl:right-3 rtl:left-auto" />

                            {doc.workflow_states_status?.steps?.sort((a, b) => a.index - b.index).map((step, idx) => {
                                const isCompleted = step.status === 'completed';
                                const isRejected = step.status === 'rejected' || step.status === 'rejected_point';
                                const isCurrent = doc.workflow_state === step.state;

                                let dotClass = 'bg-white border-slate-200';
                                if (isCompleted) {
                                    dotClass = 'bg-indigo-600 border-indigo-600';
                                } else if (isRejected) {
                                    dotClass = 'bg-white border-rose-500 ring-4 ring-rose-50';
                                } else if (isCurrent) {
                                    if (doc.workflow_states_status?.is_rejected) {
                                        dotClass = 'bg-white border-rose-500 ring-4 ring-rose-50';
                                    } else {
                                        dotClass = 'bg-white border-indigo-600 ring-4 ring-indigo-50';
                                    }
                                }

                                let textClass = 'text-slate-400';
                                if (isRejected || (isCurrent && doc.workflow_states_status?.is_rejected)) {
                                    textClass = 'text-rose-600';
                                } else if (isCurrent) {
                                    textClass = 'text-indigo-700';
                                } else if (isCompleted) {
                                    textClass = 'text-slate-600';
                                }

                                return (
                                    <div key={idx} className="relative pl-10 rtl:pr-10 rtl:pl-0 py-3 first:pt-0 last:pb-0 group">
                                        {/* Dot */}
                                        <div className={`absolute left-0 rtl:right-0 rtl:left-auto top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-all ${dotClass}`}>
                                            {isCompleted && <div className="w-2 h-2 rounded-full bg-white" />}
                                            {isRejected && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />}
                                            {isCurrent && !isRejected && <div className={`w-2.5 h-2.5 rounded-full ${doc.workflow_states_status?.is_rejected ? 'bg-rose-500' : 'bg-indigo-600'} animate-pulse`} />}
                                        </div>

                                        <div className="flex flex-col">
                                            <div className={`text-xs font-bold transition-colors ${textClass}`}>
                                                {isRTL ? (step.state_ar || step.state) : (step.state_en || step.state)}
                                            </div>
                                            {step.timestamp && (
                                                <div className="text-[10px] font-medium text-slate-400 mt-0.5">{formatDate(step.timestamp)}</div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Reverse Submittals (Returned Requests) */}
                    {(() => {
                        const previous = doc.previous_submittal_document;
                        const reSubmittals = doc.re_submittals || [];
                        const allSubmittals = [...reSubmittals];
                        if (previous) {
                            allSubmittals.push(previous);
                        }

                        // Sort by creation date descending (newest first)
                        allSubmittals.sort((a, b) => new Date(b.creation) - new Date(a.creation));

                        if (allSubmittals.length === 0) return null;

                        return (
                            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
                                <h3 className="text-lg font-black text-indigo-900 mb-4">{t('documents.reverse_submittals')}</h3>
                                <div className="space-y-3">
                                    {allSubmittals.map((submittal, i) => (
                                        <a
                                            key={i}
                                            href={`/documents/${submittal.name}`}
                                            className="block p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                                        >
                                            {submittal.name}
                                            <div className="text-[10px] text-slate-400 font-normal mt-1">{formatDate(submittal.creation)}</div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}


                    {/* History */}
                    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
                        <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2">
                            <History className="w-5 h-5" />
                            {t('documents.history')} ({history.length} {t('documents.actions')})
                        </h3>
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {history.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-xs uppercase">
                                        {item.user_full_name ? item.user_full_name.charAt(0) : 'U'}
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-bold text-xs text-slate-900">{item.user_full_name || item.user}</div>
                                            <div className="text-[9px] text-slate-400">{formatDate(item.timestamp)}</div>
                                        </div>
                                        <div className="inline-block px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                                            {item.action}
                                        </div>
                                        {item.notes && <div className="mt-2 text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100 italic">"{item.notes}"</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
                        <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2">
                            <Paperclip className="w-5 h-5" />
                            {t('documents.attachments')}
                        </h3>
                        <div className="space-y-3">
                            {files.length === 0 ? (
                                <div className="text-center py-4 text-slate-400 text-sm italic">{t('documents.no_files')}</div>
                            ) : (
                                files.map((file, idx) => {
                                    // Determine icon based on extension
                                    const ext = file.file_name.split('.').pop().toLowerCase();
                                    let Icon = File;
                                    let colorClass = 'text-slate-500 bg-slate-50';

                                    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
                                        Icon = FileImage;
                                        colorClass = 'text-purple-500 bg-purple-50';
                                    } else if (['pdf'].includes(ext)) {
                                        Icon = FileText;
                                        colorClass = 'text-rose-500 bg-rose-50';
                                    } else if (['doc', 'docx'].includes(ext)) {
                                        Icon = FileText;
                                        colorClass = 'text-blue-500 bg-blue-50';
                                    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
                                        Icon = FileText;
                                        colorClass = 'text-emerald-500 bg-emerald-50';
                                    }

                                    return (
                                        <a
                                            key={idx}
                                            href={`https://app.dms.salasah.sa${file.file_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group cursor-pointer hover:border-indigo-200 hover:bg-white hover:shadow-sm transition-all"
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass} transition-colors`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-slate-700 truncate" title={file.file_name}>
                                                    {file.file_name}
                                                </div>
                                                <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">{ext} FILE</div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                                            </div>
                                        </a>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div >
        </div >
    );
}

