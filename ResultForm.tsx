import { useEffect, useMemo, useState } from 'react';
import { Save, Loader2, RotateCcw, Trash2, CheckCircle2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Activity, Alliance, ResultRow } from '@/lib/types';
import { DAY_LABELS, DAY_ORDER } from '@/lib/types';
import { formatDate } from '@/lib/format';

interface ResultFormProps {
  alliances: Alliance[];
  activities: Activity[];
  results: ResultRow[];
  onSaved: () => void;
}

interface FormState {
  activityId: string;
  amarilla: string;
  verde: string;
  azul: string;
  notes: string;
}

const empty: FormState = {
  activityId: '',
  amarilla: '0',
  verde: '0',
  azul: '0',
  notes: '',
};

export function ResultForm({ alliances, activities, results, onSaved }: ResultFormProps) {
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const allianceByCode = useMemo(() => {
    const m: Record<string, Alliance> = {};
    for (const a of alliances) m[a.code] = a;
    return m;
  }, [alliances]);

  // Load existing result when activity changes
  useEffect(() => {
    if (!form.activityId) return;
    const rows = results.filter((r) => r.activity_id === form.activityId);
    if (rows.length === 0) {
      setForm((f) => ({
        ...f,
        amarilla: '0',
        verde: '0',
        azul: '0',
        notes: '',
      }));
      setEditingId(null);
      return;
    }
    const byCode: Record<string, number> = { amarilla: 0, verde: 0, azul: 0 };
    for (const r of rows) {
      const a = allianceByCode[r.alliance_id]
        ? Object.values(allianceByCode).find((x) => x.id === r.alliance_id)
        : undefined;
      if (a) byCode[a.code] = r.points;
    }
    setForm((f) => ({
      ...f,
      amarilla: String(byCode.amarilla),
      verde: String(byCode.verde),
      azul: String(byCode.azul),
      notes: rows[0]?.notes ?? '',
    }));
    setEditingId(rows[0]?.id ?? null);
  }, [form.activityId, results, allianceByCode]);

  const groupedActivities = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    for (const a of activities) {
      if (!map[a.day]) map[a.day] = [];
      map[a.day].push(a);
    }
    for (const k of Object.keys(map)) map[k].sort((x, y) => x.order_index - y.order_index);
    return map;
  }, [activities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.activityId) {
      setMsg({ type: 'err', text: 'Selecciona una actividad.' });
      return;
    }
    const points = {
      amarilla: parseInt(form.amarilla || '0', 10) || 0,
      verde: parseInt(form.verde || '0', 10) || 0,
      azul: parseInt(form.azul || '0', 10) || 0,
    };
    if (points.amarilla === 0 && points.verde === 0 && points.azul === 0) {
      setMsg({ type: 'err', text: 'Ingresa al menos un puntaje mayor que cero.' });
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      const activityId = form.activityId;
      const now = new Date().toISOString();

      // upsert per alliance (unique activity_id+alliance_id)
      const entries: Array<{ alliance: Alliance; pts: number }> = [
        { alliance: allianceByCode.amarilla, pts: points.amarilla },
        { alliance: allianceByCode.verde, pts: points.verde },
        { alliance: allianceByCode.azul, pts: points.azul },
      ];

      for (const { alliance, pts } of entries) {
        if (!alliance) continue;
        const { data: existing } = await supabase
          .from('results')
          .select('id')
          .eq('activity_id', activityId)
          .eq('alliance_id', alliance.id)
          .maybeSingle();

        if (existing) {
          if (pts > 0) {
            await supabase
              .from('results')
              .update({ points: pts, notes: form.notes || null, recorded_at: now })
              .eq('id', existing.id);
          } else {
            await supabase.from('results').delete().eq('id', existing.id);
          }
        } else if (pts > 0) {
          await supabase.from('results').insert({
            activity_id: activityId,
            alliance_id: alliance.id,
            points: pts,
            notes: form.notes || null,
            recorded_at: now,
          });
        }
      }

      setMsg({ type: 'ok', text: 'Resultado guardado correctamente.' });
      setEditingId(null);
      onSaved();
    } catch (err) {
      setMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Error al guardar.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.activityId) return;
    if (!confirm('¿Eliminar todos los resultados de esta actividad?')) return;
    setSaving(true);
    const { error } = await supabase
      .from('results')
      .delete()
      .eq('activity_id', form.activityId);
    setSaving(false);
    if (error) {
      setMsg({ type: 'err', text: error.message });
    } else {
      setMsg({ type: 'ok', text: 'Resultados eliminados.' });
      setForm((f) => ({ ...f, amarilla: '0', verde: '0', azul: '0', notes: '' }));
      setEditingId(null);
      onSaved();
    }
  };

  const handleReset = () => {
    setForm(empty);
    setEditingId(null);
    setMsg(null);
  };

  const codes: Array<{ code: 'amarilla' | 'verde' | 'azul'; label: string }> = [
    { code: 'amarilla', label: 'Amarilla' },
    { code: 'verde', label: 'Verde' },
    { code: 'azul', label: 'Azul' },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold uppercase text-white">
          {editingId ? 'Corregir resultado' : 'Registrar resultado'}
        </h3>
        {editingId && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-300">
            <Pencil className="h-3.5 w-3.5" /> Editando
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Actividad
          </span>
          <select
            value={form.activityId}
            onChange={(e) => setForm({ ...form, activityId: e.target.value })}
            required
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-sky-400/50"
          >
            <option value="">Selecciona una actividad…</option>
            {DAY_ORDER.map((day) =>
              (groupedActivities[day] ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {DAY_LABELS[day]} — {a.title}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {codes.map(({ code, label }) => {
            const a = allianceByCode[code];
            return (
              <label key={code} className="block">
                <span
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: a?.color_hex }}
                >
                  {label} · {a?.name}
                </span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form[code]}
                  onChange={(e) => setForm({ ...form, [code]: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-lg font-bold tabular-nums text-white outline-none focus:border-sky-400/50"
                  style={{ boxShadow: a ? `inset 0 0 0 1px ${a.color_hex}30` : undefined }}
                />
              </label>
            );
          })}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Observaciones (opcional)
          </span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-white outline-none focus:border-sky-400/50"
            placeholder="Notas sobre el resultado…"
          />
        </label>

        {msg && (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              msg.type === 'ok'
                ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-400/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            {msg.text}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Guardar
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" /> Limpiar
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-rose-300 hover:bg-rose-500/20"
            >
              <Trash2 className="h-4 w-4" /> Eliminar
            </button>
          )}
        </div>
      </form>

      {/* Existing results list */}
      {results.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Resultados registrados
          </p>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {results.map((r) => {
              const a = Object.values(allianceByCode).find((x) => x.id === r.alliance_id);
              return (
                <button
                  key={r.id}
                  onClick={() => setForm({ ...form, activityId: r.activity_id })}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-left text-sm hover:bg-slate-950/80"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-white">
                      {r.activity?.title ?? 'Actividad'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(r.recorded_at)}
                    </span>
                  </span>
                  <span className="ml-2 shrink-0 font-bold" style={{ color: a?.color_hex }}>
                    {r.points}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { CheckCircle2 };
