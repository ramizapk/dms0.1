export const STATUS_COLORS = {
    Pending: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
        gradient: 'from-amber-500 to-orange-500',
    },
    Review: {
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        dot: 'bg-sky-400',
        gradient: 'from-sky-500 to-blue-500',
    },
    Approved: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        gradient: 'from-emerald-500 to-teal-500',
    },
    Rejected: {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-400',
        gradient: 'from-rose-500 to-red-500',
    },
};

export const STATS_CARDS = [
    {
        key: 'total',
        icon: 'FileStack',
        gradient: 'from-violet-600 to-indigo-600',
        shadowColor: 'shadow-violet-500/25',
    },
    {
        key: 'pending',
        icon: 'Clock',
        gradient: 'from-amber-500 to-orange-500',
        shadowColor: 'shadow-amber-500/25',
    },
    {
        key: 'review',
        icon: 'Eye',
        gradient: 'from-sky-500 to-blue-500',
        shadowColor: 'shadow-sky-500/25',
    },
    {
        key: 'approved',
        icon: 'CheckCircle2',
        gradient: 'from-emerald-500 to-teal-500',
        shadowColor: 'shadow-emerald-500/25',
    },
];

export const NAV_ITEMS = [
    { key: 'dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { key: 'documents', path: '/documents', icon: 'FileText' },
    { key: 'projects', path: '/projects', icon: 'FolderKanban' },
    { key: 'settings', path: '/settings', icon: 'Settings' },
];
