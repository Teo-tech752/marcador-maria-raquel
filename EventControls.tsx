import { useState } from 'react';
import { Loader2, Save, Crown, Flag, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Activity, Alliance, EventState, EventStatus } from '@/lib/types';
import { EVENT_STATUS_LABELS } from '@/lib/types';

interface EventControlsProps {
  eventState: EventState | null;
  alliances: Alliance[];
  activities: Activity[];
  onChange: () => void;
}

const statuses: EventStatus[] = ['en_desarrollo', 'pausado', 'finalizado'];

const statusColors: Record<EventStatus, string> = {
  en_desarrollo: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  pausado: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  finalizado: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
};

export function EventControls({
  eventState,
  alliances,
  activities,
  onChange,
}: EventControlsProps) {
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const setStatus = async (s: EventStatus) => {
    if (!eventState) return;
    setSaving('status');
    const { error } = await supabase
      .from('event_state')
      .update({ status: s, last_updated_at: new Date().toISOString() })
      .eq('id', 1);
    setSaving(null);
    if (error) setMsg(error.message);
    else {
      setMsg('Estado del evento actualizado.');
      onChange();
    }
  };

  const setWinner = async (id: string | null) => {
    setSaving('winner');
    const { error } = await supabase
      .from('event_state')
      .update({
        winner_alliance_id: id,
        status: id ? 'finalizado' : eventState?.status,
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    setSaving(null);
    if (error) setMsg(error.message);
    else {
      setMsg(
        id
          ? 'Alianza ganadora confirmada. El evento se marcó como finalizado.'
          : 'Ganadora desmarcada.'
      );
      onChange();
    }
  };

  const setFeatured = async (id: string | null) => {
    setSaving('featured');
    // first clear all is_highlighted, then set chosen
    if (id) {
      await supabase.from('activities').update({ is_highlighted: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    }
    const { error } = await supabase
      .from('event_state')
      .update({ featured_activity_id: id, last_updated_at: new Date().toISOString() })
      .eq('id', 1);
    setSaving(null);
    if (error) setMsg(error.message);
    else {
      setMsg('Actividad destacada actualizada.');
      onChange();
    }
  };

  return (
    <div className="space-y-4">
      {/* Event status */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold uppercase text-white">
          <Flag className="h-5 w-5 text-sky-300" /> Estado del evento
        </h3>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              disabled={saving === 'status'}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                eventState?.status === s
                  ? statusColors[s]
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {EVENT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {saving === 'status' && <Loader2 className="mt-2 h-4 w-4 animate-spin text-sky-300" />}
      </div>

      {/* Winner */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
        <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold uppercase text-white">
          <Crown className="h-5 w-5 text-amber-300" /> Alianza ganadora
        </h3>
        <p className="mb-3 text-xs text-slate-400">
          Marca el evento como finalizado y confirma la alianza campeona definitiva.
          Al confirmarse, se mostrará el anuncio y la celebración en la página pública.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setWinner(null)}
            disabled={saving === 'winner'}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              !eventState?.winner_alliance_id
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Sin confirmar
          </button>
          {alliances.map((a) => (
            <button
              key={a.id}
              onClick={() => setWinner(a.id)}
              disabled={saving === 'winner'}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
              style={{
                borderColor:
                  eventState?.winner_alliance_id === a.id ? a.color_hex : 'rgba(255,255,255,0.1)',
                background:
                  eventState?.winner_alliance_id === a.id ? `${a.color_hex}22` : 'rgba(255,255,255,0.05)',
                color: eventState?.winner_alliance_id === a.id ? a.color_hex : '#cbd5e1',
              }}
            >
              {a.name}
            </button>
          ))}
        </div>
        {saving === 'winner' && <Loader2 className="mt-2 h-4 w-4 animate-spin text-amber-300" />}
      </div>

      {/* Featured activity */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
        <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold uppercase text-white">
          <Star className="h-5 w-5 text-sky-300" /> Actividad destacada
        </h3>
        <p className="mb-3 text-xs text-slate-400">
          Selecciona la actividad que se está desarrollando o el próximo hito.
        </p>
        <select
          value={eventState?.featured_activity_id ?? ''}
          onChange={(e) => setFeatured(e.target.value || null)}
          disabled={saving === 'featured'}
          className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-sky-400/50"
        >
          <option value="">Sin actividad destacada</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
        {saving === 'featured' && <Loader2 className="mt-2 h-4 w-4 animate-spin text-sky-300" />}
      </div>

      {msg && (
        <p className="rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-200">
          <Save className="mr-1 inline h-3.5 w-3.5" /> {msg}
        </p>
      )}
    </div>
  );
}
