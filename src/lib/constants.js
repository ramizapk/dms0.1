export const STATUS_COLORS = {
    Pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        gradient: 'from-amber-500 to-orange-500',
    },
    Review: {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
        gradient: 'from-sky-500 to-blue-500',
    },
    Approved: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        gradient: 'from-emerald-500 to-teal-500',
    },
    Rejected: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
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
    {
        key: 'rejected',
        icon: 'XCircle',
        gradient: 'from-rose-500 to-red-500',
        shadowColor: 'shadow-rose-500/25',
    },
];

export const NAV_ITEMS = [
    { key: 'dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { key: 'documents', path: '/documents', icon: 'FileText' },
    { key: 'projects', path: '/projects', icon: 'FolderKanban' },
    { key: 'users', path: '/users', icon: 'Users' },
    { key: 'archive', path: '/archive', icon: 'Archive' },
    { key: 'settings', path: '/settings', icon: 'Settings' },
];

export const WORKSPACE_MAPPING = {
    'Modules Launcher': 'dashboard',
    'لوحة التحكم': 'dashboard',
    'Welcome Workspace': 'dashboard',
    'المستندات': 'documents',
    'المشاريع': 'projects',
    'إدارة المستخدمين': 'users',
    'الأرشيف': 'archive',
};
