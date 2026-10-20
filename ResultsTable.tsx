import { useMemo } from 'react';
import { BarChart3, Info } from 'lucide-react';
import type { Activity, Alliance, ResultRow } from '@/lib/types';
import { DAY_LABELS } from '@/lib/types';
import { formatDate } from '@/lib/format';

interface ResultsTableProps {
  results: ResultRow[];
  alliances: Alliance[];
  activities: Activity[];
}

export function ResultsTable({ results, alliances }: ResultsTableProps) {
  const allianceById = useMemo(() => {
    const m: Record<string, Alliance> = {};
    for (const a of alliances) m[a.id] = a;
    return m;
  }, [alliances]);

  // group by activity
  const grouped = useMemo(() => {
    const map = new Map<string, { activity: ResultRow['activity']; rows: ResultRow[] }>();
    for (const r of results) {
      const key = r.activity_id;
      if (!map.has(key)) map.set(key, { activity: r.activity, rows: [] });
      map.get(key)!.rows.push(r);
    }
    return Array.from(map.entries()).map(([, v]) => v);
  }, [results]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-5 flex items-center justify-center gap-2">
        <BarChart3 className="h-6 w-6 text-emerald-300" />
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
          Resultados de las Competencias
        </h2>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-center">
          <Info className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm text-slate-300">
            Aún no se han registrado resultados.
          </p>
          <p className="text-xs text-slate-500">
            Los puntajes aparecerán aquí a medida que el administrador los registre.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ activity, rows }) => (
            <ResultCard
              key={activity?.id ?? rows[0].activity_id}
              activity={activity}
              rows={rows}
              allianceById={allianceById}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ResultCard({
  activity,
  rows,
  allianceById,
}: {
  activity: ResultRow['activity'];
  rows: ResultRow[];
  allianceById: Record<string, Alliance>;
}) {
  // ensure all three alliances show, even if 0
  const byAlliance: Record<string, number> = { amarilla: 0, verde: 0, azul: 0 };
  let notes: string | null = null;
  let recordedAt = '';
  for (const r of rows) {
    const a = allianceById[r.alliance_id];
    if (a) byAlliance[a.code] = r.points;
    if (r.notes) notes = r.notes;
    if (!recordedAt || r.recorded_at > recordedAt) recordedAt = r.recorded_at;
  }

  const codes: Array<'amarilla' | 'verde' | 'azul'> = ['amarilla', 'verde', 'azul'];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
        <div>
          <p className="font-semibold text-white">{activity?.title ?? 'Actividad'}</p>
          <p className="text-xs text-slate-400">
            {activity ? DAY_LABELS[activity.day] : ''}
            {activity?.location ? ` · ${activity.location}` : ''}
          </p>
        </div>
        {recordedAt && (
          <span className="text-[11px] text-slate-500">Registrado {formatDate(recordedAt)}</span>
        )}
      </div>
      <div className="grid grid-cols-3 divide-x divide-white/10">
        {codes.map((code) => {
          const a = Object.values(allianceById).find((x) => x.code === code);
          const pts = byAlliance[code];
          const color = a?.color_hex ?? '#fff';
          return (
            <div key={code} className="px-3 py-4 text-center">
              <p className="text-[11px] uppercase tracking-wider" style={{ color }}>
                {a?.name ?? code}
              </p>
              <p
                className="font-display mt-1 text-2xl font-bold tabular-nums sm:text-3xl"
                style={{ color: pts > 0 ? color : '#64748b' }}
              >
                {pts}
              </p>
            </div>
          );
        })}
      </div>
      {notes && (
        <p className="border-t border-white/10 px-4 py-2 text-xs text-slate-400">
          Observaciones: {notes}
        </p>
      )}
    </div>
  );
}
