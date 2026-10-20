import { History } from 'lucide-react';
import type { ChangeLogEntry } from '@/lib/types';
import { formatDate } from '@/lib/format';

const actionLabels: Record<string, string> = {
  result_create: 'Resultado registrado',
  result_update: 'Resultado corregido',
  result_delete: 'Resultado eliminado',
  activity_status: 'Estado de actividad',
  event_state: 'Estado del evento',
  notice_update: 'Aviso actualizado',
  winner_set: 'Ganadora confirmada',
};

export function ChangeLogView({ entries }: { entries: ChangeLogEntry[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
      <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold uppercase text-white">
        <History className="h-5 w-5 text-sky-300" /> Historial de cambios
      </h3>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-400">Sin registros todavía.</p>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {entries.map((e) => (
            <div
              key={e.id}
              className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">
                  {actionLabels[e.action] ?? e.action}
                </span>
                <span className="text-[11px] text-slate-500">
                  {formatDate(e.created_at)}
                </span>
              </div>
              <p className="text-xs text-slate-400">{e.description}</p>
              {e.actor_email && (
                <p className="text-[11px] text-slate-500">por {e.actor_email}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
