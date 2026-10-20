import { Crown, Medal, Trophy } from 'lucide-react';
import type { Alliance } from '@/lib/types';
import type { RankedAlliance } from '@/lib/data';
import { useCountUp } from '@/lib/useCountUp';

interface ClassificationProps {
  ranking: RankedAlliance[];
  alliances: Alliance[];
  isFinal: boolean;
}

export function Classification({ ranking, isFinal }: ClassificationProps) {
  if (ranking.length === 0) return null;
  const [first, ...rest] = ranking;
  const color = first.alliance.color_hex;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-5 flex items-center justify-center gap-2">
        <Trophy className="h-6 w-6 text-amber-300" />
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
          Clasificación General
        </h2>
      </div>

      {/* Champion card */}
      <div className="relative mx-auto mb-5 max-w-3xl animate-pop-in">
        <div
          className="absolute -inset-2 rounded-3xl opacity-60 blur-2xl"
          style={{ background: `radial-gradient(closest-side, ${color}66, transparent)` }}
        />
        <div
          className="relative overflow-hidden rounded-3xl border p-[1px]"
          style={{ background: `linear-gradient(160deg, ${color}66, transparent 60%)` }}
        >
          <div className="rounded-[calc(1.5rem-1px)] border border-white/10 bg-slate-950/80 p-6 text-center">
            <Crown
              className="mx-auto h-10 w-10 text-amber-300 crown-bounce"
              strokeWidth={1.5}
            />
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-200/80">
              {isFinal ? 'Campeona definitiva' : 'Líder provisional'}
            </p>
            <p
              className="font-display mt-1 text-3xl font-bold uppercase sm:text-4xl"
              style={{ color, textShadow: `0 0 30px ${color}66` }}
            >
              {first.alliance.name}
            </p>
            <ChampionScore total={first.total} color={color} />
            {first.isTie && (
              <p className="mt-2 text-xs text-amber-200/80">
                Empate por el primer lugar
              </p>
            )}
            {!first.isTie && first.diffToNext !== null && first.diffToNext > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                Ventaja de {first.diffToNext} puntos sobre el 2° lugar
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rest of ranking */}
      <div className="mx-auto max-w-3xl space-y-3">
        {rest.map((r) => (
          <RankRow key={r.alliance.id} rank={r} />
        ))}
      </div>
    </section>
  );
}

function ChampionScore({ total, color }: { total: number; color: string }) {
  const display = useCountUp(total, 900);
  return (
    <p className="mt-3">
      <span
        className="font-display text-5xl font-bold tabular-nums sm:text-6xl"
        style={{ color, textShadow: `0 0 30px ${color}55` }}
      >
        {display.toLocaleString('es-CL')}
      </span>
      <span className="ml-2 text-sm text-slate-400">puntos</span>
    </p>
  );
}

function RankRow({ rank }: { rank: RankedAlliance }) {
  const color = rank.alliance.color_hex;
  const display = useCountUp(rank.total, 800);
  const medalColor =
    rank.rank === 2 ? 'text-slate-300' : rank.rank === 3 ? 'text-amber-600' : 'text-slate-500';
  return (
    <div
      className="rank-rise flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4"
      style={{ boxShadow: `inset 4px 0 0 ${color}` }}
    >
      <div className="flex items-center gap-3">
        <span className={`flex items-center gap-1 font-display text-lg font-bold ${medalColor}`}>
          {rank.rank === 2 || rank.rank === 3 ? (
            <Medal className="h-5 w-5" />
          ) : (
            `#${rank.rank}`
          )}
        </span>
        <div>
          <p className="font-display text-lg font-bold uppercase text-white">
            {rank.alliance.name}
          </p>
          <p className="text-xs text-slate-400" style={{ color }}>
            {rank.alliance.code === 'amarilla'
              ? 'Alianza Amarilla'
              : rank.alliance.code === 'verde'
                ? 'Alianza Verde'
                : 'Alianza Azul'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-display text-2xl font-bold tabular-nums text-white">
          {display.toLocaleString('es-CL')}
        </p>
        {rank.diffToNext !== null && rank.diffToNext > 0 && (
          <p className="text-[11px] text-slate-500">+{rank.diffToNext} al siguiente</p>
        )}
        {rank.isTie && (
          <p className="text-[11px] text-amber-300/80">Empate</p>
        )}
      </div>
    </div>
  );
}
