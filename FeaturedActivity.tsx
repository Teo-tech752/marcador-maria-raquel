import { Star, MapPin, Clock, Calendar } from 'lucide-react';
import type { Activity, Alliance } from '@/lib/types';
import { DAY_LABELS } from '@/lib/types';

interface FeaturedActivityProps {
  activity: Activity | null;
  alliances: Alliance[];
}

export function FeaturedActivity({ activity }: FeaturedActivityProps) {
  if (!activity) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 text-center">
          <Star className="mx-auto h-7 w-7 text-sky-300/80" />
          <p className="mt-2 text-sm text-slate-300">
            Consulta el programa de actividades
          </p>
          <p className="text-xs text-slate-500">
            La actividad destacada aparecerá aquí cuando el administrador la seleccione.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="relative overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-slate-900/60 to-slate-900/80 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl pulse-glow" />
        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-300">
            <Star className="h-4 w-4 fill-sky-300" /> Actividad destacada
          </p>
          <h3 className="font-display mt-2 text-2xl font-bold uppercase text-white sm:text-3xl">
            {activity.title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Calendar className="h-4 w-4 text-sky-300" />
              {DAY_LABELS[activity.day]}
            </span>
            {activity.location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <MapPin className="h-4 w-4 text-emerald-300" />
                {activity.location}
              </span>
            )}
            {activity.scheduled_time && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Clock className="h-4 w-4 text-amber-300" />
                {activity.scheduled_time} h
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
