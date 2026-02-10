'use client';

export default function MiniStatBadge({ abbr, count }) {
    if (count === 0) return null;

    return (
        <span className="group inline-flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-all hover:bg-white/10 hover:border-indigo-500/30 hover:text-white cursor-default">
            <span className="text-indigo-400 group-hover:scale-110 transition-transform">{abbr}</span>
            <span className="h-4 w-px bg-white/10 group-hover:bg-indigo-500/30 transition-colors" />
            <span className="text-slate-200">{count}</span>
        </span>
    );
}
