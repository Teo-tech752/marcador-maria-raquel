import { useEffect, useRef, useState } from 'react';
import { Flame, Trees, Droplet, Crown, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import type { Alliance, AllianceCode } from '@/lib/types';
import { useCountUp } from '@/lib/useCountUp';

interface AllianceCardProps {
  alliance: Alliance;
  total: number;
  rank: number;
  prevRank: number | null;
  isLeader: boolean;
  isWinner: boolean;
  index: number;
}

const icons: Record<AllianceCode, typeof Flame> = {
  amarilla: Flame,
  verde: Trees,
  azul: Droplet,
};

const labelMap: Record<AllianceCode, string> = {
  amarilla: 'Alianza Amarilla',
  verde: 'Alianza Verde',
  azul: 'Alianza Azul',
};

export function AllianceCard({
  alliance,
  total,
  rank,
  prevRank,
  isLeader,
  isWinner,
  index,
}: AllianceCardProps) {
  const Icon = icons[alliance.code] ?? Flame;
  const display = useCountUp(total, 900);
  const previousTotal = useRef(total);
  const [scoreChanged, setScoreChanged] = useState(false);

  useEffect(() => {
    if (previousTotal.current !== total) {
      setScoreChanged(true);
      const timeout = window.setTimeout(() => setScoreChanged(false), 1200);
      previousTotal.current = total;
      return () => window.clearTimeout(timeout);
    }
    previousTotal.current = total;
  }, [total]);

  const trend =
    prevRank === null || prevRank === rank
      ? 'same'
      : rank < prevRank
        ? 'up'
        : 'down';

  const color = alliance.color_hex;
  const accent = alliance.accent_hex;

  return (
    <article
      className={`group relative animate-pop-in overflow-hidden rounded-3xl border p-[1px] transition-transform duration-500 ${
        isLeader ? 'scale-[1.015]' : 'hover:scale-[1.01]'
      } ${scoreChanged ? 'score-change' : ''}`}
      style={{
        animationDelay: `${index * 90}ms`,
        background: `linear-gradient(160deg, ${color}55, transparent 55%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(120% 80% at 50% -10%, ${color}40, transparent 60%)`,
        }}
      />
      {isLeader && (
        <div
          className="absolute -inset-x-10 -top-24 h-40 opacity-70 blur-3xl pulse-glow"
          style={{ background: `radial-gradient(closest-side, ${color}55, transparent)` }}
        />
      )}

      <div
        className="card-shine relative rounded-[calc(1.5rem-1px)] border border-white/10 bg-slate-950/70 p-5 sm:p-6"
        data-alliance={alliance.code}
        style={{ boxShadow: `0 18px 40px -24px ${accent}` }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 glass"
              style={{ color }}
            >
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                {labelMap[alliance.code]}
              </p>
              <h3 className="font-display text-xl font-bold uppercase leading-none text-white sm:text-2xl">
                {alliance.name}
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-900"
              style={{ background: color }}
            >
              {rank === 1 ? '1°' : `${rank}°`}
            </span>
            <TrendBadge trend={trend} />
          </div>
        </div>

        {/* Score */}
        <div className="mt-6">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">
            Puntaje total
          </p>
          <div className="flex items-end gap-2">
            <span
              className="font-display text-5xl font-bold tabular-nums leading-none sm:text-6xl"
              style={{ color, textShadow: `0 0 28px ${color}55` }}
            >
              {display.toLocaleString('es-CL')}
            </span>
            {isWinner && (
              <Crown className="mb-1 h-7 w-7 text-amber-300 crown-bounce" />
            )}
            {scoreChanged && (
              <span className="score-burst ml-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                <Sparkles className="h-4 w-4" /> Nuevo
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between text-xs">
          <span
            className="rounded-lg border px-2 py-1"
            style={{ borderColor: `${color}40`, color }}
          >
            {isWinner
              ? 'Campeona definitiva'
              : isLeader
                ? 'Líder provisional'
                : 'En carrera'}
          </span>
          <div
            className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10"
            aria-hidden
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.max(6, total === 0 ? 6 : 60 + total / 20))}%`,
                background: `linear-gradient(90deg, ${color}, ${accent})`,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function TrendBadge({ trend }: { trend: 'up' | 'down' | 'same' }) {
  if (trend === 'up')
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-semibold"
        style={{ color: '#34d399' }}
      >
        <TrendingUp className="h-3.5 w-3.5" /> Subió
      </span>
    );
  if (trend === 'down')
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-semibold"
        style={{ color: '#f87171' }}
      >
        <TrendingDown className="h-3.5 w-3.5" /> Bajó
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400"
    >
      <Minus className="h-3.5 w-3.5" /> —
    </span>
  );
}
