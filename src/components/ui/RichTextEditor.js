'use client';

import dynamic from 'next/dynamic';
import { useI18n } from '@/i18n/provider';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        return function Comp(props) {
            return <RQ {...props} />;
        };
    },
    {
        ssr: false,
        loading: () => (
            <div className="bg-white min-h-[150px] animate-pulse">
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 flex items-center gap-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded bg-slate-200" />
                    ))}
                </div>
                <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                </div>
            </div>
        )
    }
);

import 'react-quill-new/dist/quill.snow.css';

export default function RichTextEditor({
    value,
    onChange,
    label,
    placeholder,
    error,
    required = false,
    readOnly = false,
    className = ''
}) {
    const { isRTL } = useI18n();

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': isRTL ? 'rtl' : 'ltr' }],
            [{ 'align': [] }],
            ['link', 'clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent',
        'direction', 'align',
        'link'
    ];

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div dir={isRTL ? 'rtl' : 'ltr'} className={`
                rich-text-editor-wrapper
                rounded-xl border bg-slate-50/50 overflow-hidden transition-all
                ${error
                    ? 'border-red-500 focus-within:ring-4 focus-within:ring-red-500/10'
                    : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10'
                }
                ${readOnly ? 'opacity-70 pointer-events-none bg-slate-100' : ''}
            `}>
                <ReactQuill
                    theme="snow"
                    value={value || ''}
                    onChange={onChange}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    className="bg-white min-h-[150px]"
                />
            </div>

            {error && (
                <p className="text-xs text-red-600 font-black animate-in slide-in-from-top-1">
                    {error}
                </p>
            )}

            <style jsx global>{`
                .ql-container.ql-snow {
                    border: none !important;
                    font-family: inherit !important;
                    font-size: 0.875rem !important;
                    min-height: 150px;
                }
                .ql-toolbar.ql-snow {
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    background-color: #f8fafc;
                }
                .ql-editor {
                    padding: 1rem !important;
                    min-height: 150px;
                }
                .ql-editor.ql-blank::before {
                    color: #94a3b8 !important;
                    font-style: normal !important;
                }
                /* RTL Support */
                [dir="rtl"] .ql-editor {
                    direction: rtl !important;
                    text-align: right !important;
                }
                [dir="rtl"] .ql-editor.ql-blank::before {
                    right: 1rem !important;
                    left: auto !important;
                    direction: rtl !important;
                    text-align: right !important;
                }
                [dir="rtl"] .ql-toolbar.ql-snow {
                    direction: rtl !important;
                }
                [dir="ltr"] .ql-editor {
                    direction: ltr !important;
                    text-align: left !important;
                }
                [dir="ltr"] .ql-editor.ql-blank::before {
                    left: 1rem !important;
                    right: auto !important;
                }
            `}</style>
        </div>
    );
}
