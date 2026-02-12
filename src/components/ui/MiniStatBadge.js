'use client';

export default function MiniStatBadge({ abbr, count }) {
    // if (count === 0) return null;

    return (
        <span className="group inline-flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all hover:bg-white hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md cursor-default">
            <span className="text-indigo-500 group-hover:scale-110 transition-transform">{abbr}</span>
            <span className="h-4 w-px bg-slate-200 group-hover:bg-indigo-100 transition-colors" />
            <span className="text-slate-700 group-hover:text-slate-900">{count}</span>
        </span>
    );
}
