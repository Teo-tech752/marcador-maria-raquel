import { CloudRain, Pencil } from 'lucide-react';
import type { RainNotice } from '@/lib/types';
import { formatDate } from '@/lib/format';

interface RainNoticeBlockProps {
  notice: RainNotice | null;
}

export function RainNoticeBlock({ notice }: RainNoticeBlockProps) {
  if (!notice || !notice.is_visible) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="relative overflow-hidden rounded-3xl border border-sky-400/25 bg-gradient-to-br from-sky-500/10 via-slate-900/70 to-slate-950/80 p-6 sm:p-7">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl pulse-glow" />
        <div className="relative flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-400/30 bg-sky-500/15 text-sky-300">
            <CloudRain className="h-6 w-6" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-300">
              <Pencil className="h-3.5 w-3.5" /> Importante
            </p>
            <p className="mt-2 text-balance text-sm leading-relaxed text-slate-100 sm:text-base">
              {notice.text}
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              Actualizado {formatDate(notice.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
