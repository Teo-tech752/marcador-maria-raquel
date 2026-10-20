import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Activity, ActivityDay, ActivityStatus } from '@/lib/types';
import { DAY_LABELS, DAY_ORDER, STATUS_LABELS } from '@/lib/types';

interface ActivityManagerProps {
  activities: Activity[];
  onChange: () => void;
}

const statuses: ActivityStatus[] = ['pendiente', 'en_desarrollo', 'finalizada', 'suspendida'];

const statusColors: Record<ActivityStatus, string> = {
  pendiente: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  en_desarrollo: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
  finalizada: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  suspendida: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
};

export function ActivityManager({ activities, onChange }: ActivityManagerProps) {
  const update = async (id: string, patch: Partial<Activity>) => {
    await supabase.from('activities').update(patch).eq('id', id);
    onChange();
  };

  const grouped: Record<ActivityDay, Activity[]> = {
    lunes: [],
    martes: [],
    miercoles: [],
    jueves_manana: [],
    jueves_tarde: [],
    viernes: [],
  };
  for (const a of activities) grouped[a.day]?.push(a);
  for (const k of DAY_ORDER) grouped[k].sort((x, y) => x.order_index - y.order_index);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
      <h3 className="mb-4 font-display text-lg font-bold uppercase text-white">
        Estado de actividades
      </h3>
      <div className="space-y-5">
        {DAY_ORDER.map((day) => {
          const items = grouped[day];
          if (items.length === 0) return null;
          return (
            <div key={day}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-300">
                {DAY_LABELS[day]}
              </p>
              <div className="space-y-2">
                {items.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-950/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-white">{a.title}</p>
                      {a.location && (
                        <p className="text-xs text-slate-500">{a.location}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {statuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => update(a.id, { status: s })}
                          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                            a.status === s
                              ? statusColors[s]
                              : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          update(a.id, { is_highlighted: !a.is_highlighted })
                        }
                        className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                          a.is_highlighted
                            ? 'border-amber-400/40 bg-amber-500/20 text-amber-300'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {a.is_highlighted ? '★ Destacada' : '☆ Destacar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        <Loader2 className="mr-1 inline h-3 w-3" /> Los cambios se guardan automáticamente.
      </p>
    </div>
  );
}
