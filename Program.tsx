import { useMemo, useState } from 'react';
import { CalendarDays, MapPin, Clock, CheckCircle2, Loader2, PauseCircle, AlertTriangle } from 'lucide-react';
import type { Activity, ActivityDay, ActivityStatus } from '@/lib/types';
import { DAY_LABELS, DAY_ORDER, STATUS_LABELS } from '@/lib/types';

interface ProgramProps {
  activities: Activity[];
}

const statusMeta: Record<
  ActivityStatus,
  { label: string; icon: typeof CheckCircle2; cls: string; dot: string }
> = {
  pendiente: {
    label: STATUS_LABELS.pendiente,
    icon: Clock,
    cls: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
    dot: 'bg-slate-400',
  },
  en_desarrollo: {
    label: STATUS_LABELS.en_desarrollo,
    icon: Loader2,
    cls: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
    dot: 'bg-sky-400',
  },
  finalizada: {
    label: STATUS_LABELS.finalizada,
    icon: CheckCircle2,
    cls: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  suspendida: {
    label: STATUS_LABELS.suspendida,
    icon: PauseCircle,
    cls: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
  },
};

export function Program({ activities }: ProgramProps) {
  const grouped = useMemo(() => {
    const map: Record<ActivityDay, Activity[]> = {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves_manana: [],
      jueves_tarde: [],
      viernes: [],
    };
    for (const a of activities) {
      if (map[a.day]) map[a.day].push(a);
    }
    for (const k of Object.keys(map) as ActivityDay[]) {
      map[k].sort((x, y) => x.order_index - y.order_index);
    }
    return map;
  }, [activities]);

  const firstWithActivities = DAY_ORDER.find((d) => grouped[d].length > 0) ?? 'lunes';
  const [activeDay, setActiveDay] = useState<ActivityDay>(firstWithActivities);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-5 flex items-center justify-center gap-2">
        <CalendarDays className="h-6 w-6 text-sky-300" />
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
          Programa Oficial de Actividades
        </h2>
      </div>

      {/* Day tabs */}
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {DAY_ORDER.map((day) => {
          const active = day === activeDay;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                active
                  ? 'border-sky-400/40 bg-sky-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {DAY_LABELS[day]}
            </button>
          );
        })}
      </div>

      {/* Day cards */}
      <div key={activeDay} className="animate-fade-up">
        <DayBlock day={activeDay} items={grouped[activeDay]} />
      </div>
    </section>
  );
}

function DayBlock({ day, items }: { day: ActivityDay; items: Activity[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-center text-sm text-slate-400">
        Sin actividades registradas para {DAY_LABELS[day]}.
      </p>
    );
  }
  const location = items[0].location;
  return (
    <div>
      {location && (
        <p className="mb-3 flex items-center justify-center gap-1.5 text-sm text-slate-300">
          <MapPin className="h-4 w-4 text-emerald-300" /> Lugar: {location}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((a) => (
          <ActivityCard key={a.id} activity={a} />
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const meta = statusMeta[activity.status] ?? statusMeta.pendiente;
  const Icon = meta.icon;
  const inProgress = activity.status === 'en_desarrollo';
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-slate-900/60 p-4 transition-all hover:bg-slate-900/80 ${
        activity.is_highlighted ? 'border-sky-400/40' : 'border-white/10'
      }`}
    >
      {activity.is_highlighted && (
        <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-sky-500/20 blur-2xl pulse-glow" />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-white">{activity.title}</p>
          {activity.scheduled_time && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-amber-300" /> {activity.scheduled_time} h
            </p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}
        >
          <Icon className={`h-3.5 w-3.5 ${inProgress ? 'animate-spin' : ''}`} />
          {meta.label}
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        </span>
      </div>
    </div>
  );
}

// re-export for potential reuse
export { statusMeta };
export const _icons = { AlertTriangle };
