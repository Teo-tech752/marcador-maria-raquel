import { useState } from 'react';
import { LogOut, ExternalLink, Trophy, ClipboardList, Sliders, History, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useMarcadorData } from '@/lib/useMarcadorData';
import { computeRanking } from '@/lib/data';
import { ResultForm } from './ResultForm';
import { ActivityManager } from './ActivityManager';
import { EventControls } from './EventControls';
import { NoticeEditor } from './NoticeEditor';
import { ChangeLogView } from './ChangeLogView';

interface AdminDashboardProps {
  onExit: () => void;
}

type Tab = 'results' | 'activities' | 'event' | 'notice' | 'history';

const tabs: Array<{ id: Tab; label: string; icon: typeof Trophy }> = [
  { id: 'results', label: 'Resultados', icon: ClipboardList },
  { id: 'activities', label: 'Actividades', icon: Trophy },
  { id: 'event', label: 'Evento', icon: Sliders },
  { id: 'notice', label: 'Aviso', icon: History },
  { id: 'history', label: 'Historial', icon: History },
];

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const { signOut, user } = useAuth();
  const [tab, setTab] = useState<Tab>('results');
  const [menuOpen, setMenuOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const data = useMarcadorData();
  const ranking = computeRanking(data.results, data.alliances);

  const reload = () => setReloadKey((k) => k + 1);

  const handleSignOut = async () => {
    await signOut();
    onExit();
  };

  return (
    <div className="app-bg min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wider text-white sm:text-base">
              Panel · Marcador Oficial
            </p>
            <p className="text-[11px] text-slate-400">
              {user?.email ?? 'Administrador'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExit}
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 hover:bg-white/10 sm:flex"
            >
              <ExternalLink className="h-4 w-4" /> Ver página pública
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/20"
            >
              <LogOut className="h-4 w-4" /> Salir
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 sm:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Quick ranking preview */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          {ranking.map((r) => (
            <div
              key={r.alliance.id}
              className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-center"
              style={{ boxShadow: `inset 3px 0 0 ${r.alliance.color_hex}` }}
            >
              <p className="text-[11px] uppercase" style={{ color: r.alliance.color_hex }}>
                {r.rank}°
              </p>
              <p className="font-display text-xl font-bold tabular-nums text-white">
                {r.total}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                tab === id
                  ? 'border-sky-400/40 bg-sky-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              } ${menuOpen && tab !== id ? 'hidden sm:flex' : ''}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div key={reloadKey}>
          {data.loading ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
              <p className="mt-3 text-sm text-slate-400">Cargando datos…</p>
            </div>
          ) : (
            <>
              {tab === 'results' && (
                <ResultForm
                  alliances={data.alliances}
                  activities={data.activities}
                  results={data.results}
                  onSaved={reload}
                />
              )}
              {tab === 'activities' && (
                <ActivityManager activities={data.activities} onChange={reload} />
              )}
              {tab === 'event' && (
                <EventControls
                  eventState={data.eventState}
                  alliances={data.alliances}
                  activities={data.activities}
                  onChange={reload}
                />
              )}
              {tab === 'notice' && (
                <NoticeEditor notice={data.rainNotice} onChange={reload} />
              )}
              {tab === 'history' && <ChangeLogView entries={data.changeLog} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
