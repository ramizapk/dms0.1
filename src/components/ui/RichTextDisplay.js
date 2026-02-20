'use client';

/**
 * RichTextDisplay - A reusable component to render rich text HTML content
 * with proper styling that matches the Quill editor output.
 * Use this to display content created with RichTextEditor.
 */
export default function RichTextDisplay({ content, className = '' }) {
    if (!content || content === '<p><br></p>') {
        return (
            <span className="text-slate-400 italic text-sm">—</span>
        );
    }

    return (
        <div className={`rich-text-display ${className}`}>
            <div
                className="ql-content-display"
                dangerouslySetInnerHTML={{ __html: content }}
            />

            <style jsx global>{`
                .ql-content-display {
                    font-family: inherit;
                    font-size: 0.875rem;
                    line-height: 1.7;
                    color: #334155;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .ql-content-display h1 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    color: #1e293b;
                }
                .ql-content-display h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.4rem;
                    color: #1e293b;
                }
                .ql-content-display h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 0.3rem;
                    color: #1e293b;
                }
                .ql-content-display p {
                    margin-bottom: 0.4rem;
                }
                .ql-content-display strong {
                    font-weight: 800;
                    color: #1e293b;
                }
                .ql-content-display em {
                    font-style: italic;
                }
                .ql-content-display u {
                    text-decoration: underline;
                }
                .ql-content-display s {
                    text-decoration: line-through;
                }
                .ql-content-display blockquote {
                    border-left: 4px solid #6366f1;
                    padding: 0.5rem 1rem;
                    margin: 0.5rem 0;
                    background: #f1f5f9;
                    border-radius: 0 0.5rem 0.5rem 0;
                    color: #475569;
                    font-style: italic;
                }
                [dir="rtl"] .ql-content-display blockquote {
                    border-left: none;
                    border-right: 4px solid #6366f1;
                    border-radius: 0.5rem 0 0 0.5rem;
                }
                .ql-content-display ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin: 0.3rem 0;
                }
                [dir="rtl"] .ql-content-display ol {
                    padding-left: 0;
                    padding-right: 1.5rem;
                }
                .ql-content-display ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin: 0.3rem 0;
                }
                [dir="rtl"] .ql-content-display ul {
                    padding-left: 0;
                    padding-right: 1.5rem;
                }
                .ql-content-display li {
                    margin-bottom: 0.15rem;
                }
                .ql-content-display a {
                    color: #4f46e5;
                    text-decoration: underline;
                }
                .ql-content-display a:hover {
                    color: #4338ca;
                }
                .ql-content-display .ql-align-center {
                    text-align: center;
                }
                .ql-content-display .ql-align-right {
                    text-align: right;
                }
                .ql-content-display .ql-align-justify {
                    text-align: justify;
                }
                .ql-content-display .ql-indent-1 {
                    padding-left: 2rem;
                }
                .ql-content-display .ql-indent-2 {
                    padding-left: 4rem;
                }
                [dir="rtl"] .ql-content-display .ql-indent-1 {
                    padding-left: 0;
                    padding-right: 2rem;
                }
                [dir="rtl"] .ql-content-display .ql-indent-2 {
                    padding-left: 0;
                    padding-right: 4rem;
                }
            `}</style>
        </div>
    );
}
