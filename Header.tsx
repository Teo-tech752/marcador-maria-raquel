import { Trophy, CalendarDays, Sparkles } from 'lucide-react';
import type { EventState } from '@/lib/types';
import { EVENT_STATUS_LABELS } from '@/lib/types';
import { formatTimeAgo } from '@/lib/format';

interface HeaderProps {
  eventState: EventState | null;
  refreshedAt: number;
}

const statusStyles: Record<string, string> = {
  en_desarrollo:
    'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  pausado: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  finalizado: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
};

export function Header({ eventState, refreshedAt }: HeaderProps) {
  const status = eventState?.status ?? 'en_desarrollo';

  return (
    <header className="relative overflow-hidden">
      {/* glow backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl pulse-glow" />
        <div className="absolute top-10 left-[12%] h-40 w-40 rounded-full bg-amber-400/15 blur-2xl float-y" />
        <div className="absolute top-16 right-[12%] h-40 w-40 rounded-full bg-emerald-400/15 blur-2xl float-y" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-6 sm:pt-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-3 rounded-2xl border border-sky-300/20 bg-slate-900/65 px-5 py-3 shadow-lg shadow-sky-950/30 glass">
            <Trophy className="h-8 w-8 text-amber-300" strokeWidth={1.6} />
            <div className="text-left">
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                Marcador oficial
              </p>
              <p className="text-xs text-slate-400">45 años · edición 2026</p>
            </div>
          </div>

          <p className="font-display text-xs tracking-[0.35em] text-sky-300/80 sm:text-sm">
            SEMANA DE ANIVERSARIO
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold uppercase leading-tight text-white drop-shadow sm:text-5xl">
            Semana de Aniversario
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Colegio María Raquel ·{' '}
            <span className="text-white">45 años al servicio de la comunidad</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 sm:text-sm">
            <CalendarDays className="h-4 w-4 text-sky-300" />
            <span>19 al 23 de octubre de 2026</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                statusStyles[status] ?? statusStyles.en_desarrollo
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-current opacity-60 ${
                    status === 'en_desarrollo' ? 'animate-ping' : ''
                  }`}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
              </span>
              {EVENT_STATUS_LABELS[status]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              Actualizado {formatTimeAgo(new Date(refreshedAt).toISOString())}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
