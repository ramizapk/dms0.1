'use client';

export default function MiniStatBadge({ abbr, count, isActive, onClick }) {
    // if (count === 0) return null;

    return (
        <button
            onClick={onClick}
            className={`group inline-flex items-center gap-3 rounded-xl border px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:shadow-md ${isActive
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-indigo-200 hover:text-indigo-600'
                }`}
        >
            <span className={`transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-indigo-500'}`}>{abbr}</span>
            <span className={`h-4 w-px transition-colors ${isActive ? 'bg-indigo-500' : 'bg-slate-200 group-hover:bg-indigo-100'}`} />
            <span className={isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'}>{count}</span>
        </button>
    );
}
