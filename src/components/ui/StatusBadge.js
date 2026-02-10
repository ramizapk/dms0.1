'use client';

import { STATUS_COLORS } from '@/lib/constants';
import { useI18n } from '@/i18n/provider';

export default function StatusBadge({ status }) {
    const { t } = useI18n();
    const colors = STATUS_COLORS[status] || STATUS_COLORS.Pending;

    return (
        <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${colors.bg} ${colors.text} border ${colors.border} shadow-sm backdrop-blur-sm transition-all hover:scale-105 cursor-default`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot} shadow-[0_0_8px_currentColor]`} />
            {t(`status.${status}`) || status}
        </span>
    );
}
