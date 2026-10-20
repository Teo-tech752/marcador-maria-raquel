import { useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { AllianceCard } from '@/components/AllianceCard';
import { Classification } from '@/components/Classification';
import { FeaturedActivity } from '@/components/FeaturedActivity';
import { ResultsTable } from '@/components/ResultsTable';
import { Program } from '@/components/Program';
import { RainNoticeBlock } from '@/components/RainNoticeBlock';
import { Footer } from '@/components/Footer';
import { useMarcadorData } from '@/lib/useMarcadorData';
import { computeRanking } from '@/lib/data';
import { fireConfetti } from '@/lib/confetti';
import type { Alliance } from '@/lib/types';

export function PublicPage() {
  const data = useMarcadorData();
  const ranking = computeRanking(data.results, data.alliances);

  // Track rank changes for trend arrows
  const prevRanksRef = useRef<Record<string, number> | null>(null);
  const prevRanks = prevRanksRef.current;
  const currentRanks: Record<string, number> = {};
  for (const r of ranking) currentRanks[r.alliance.id] = r.rank;
  prevRanksRef.current = currentRanks;

  const winnerId = data.eventState?.winner_alliance_id ?? null;
  const isFinal = data.eventState?.status === 'finalizado';
  const leaderId = ranking[0]?.alliance.id;

  const winnerAlliance: Alliance | undefined = data.alliances.find(
    (a) => a.id === winnerId
  );

  // Confetti when winner is set / event finalized
  const firedRef = useRef(false);
  useEffect(() => {
    if (isFinal && winnerId && !firedRef.current) {
      fireConfetti(5000);
      firedRef.current = true;
    }
    if (!isFinal || !winnerId) {
      firedRef.current = false;
    }
  }, [isFinal, winnerId]);

  const featuredActivity =
    data.activities.find((a) => a.id === data.eventState?.featured_activity_id) ??
    data.activities.find((a) => a.is_highlighted) ??
    null;

  if (data.loading) {
    return (
      <div className="app-bg min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
          <p className="mt-4 text-sm text-slate-400">Cargando marcador…</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="app-bg min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <p className="text-sm text-rose-300">No se pudo cargar el marcador.</p>
          <p className="mt-1 text-xs text-slate-500">{data.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg min-h-screen">
      <Header eventState={data.eventState} refreshedAt={data.refreshedAt} />

      {/* Winner banner */}
      {isFinal && winnerAlliance && (
        <section className="mx-auto max-w-6xl px-4 pt-2">
          <div
            className="relative overflow-hidden rounded-3xl border p-[1px] animate-pop-in"
            style={{
              background: `linear-gradient(160deg, ${winnerAlliance.color_hex}77, transparent 60%)`,
            }}
          >
            <div className="rounded-[calc(1.5rem-1px)] border border-white/10 bg-slate-950/80 p-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-200/80">
                Alianza campeona definitiva
              </p>
              <h2
                className="font-display mt-1 text-4xl font-bold uppercase sm:text-5xl"
                style={{ color: winnerAlliance.color_hex }}
              >
                {winnerAlliance.name}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                ¡Felicidades a la {winnerAlliance.code} por la Semana de Aniversario!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Alliance cards */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {data.alliances.map((a, i) => {
            const r = ranking.find((x) => x.alliance.id === a.id);
            if (!r) return null;
            return (
              <AllianceCard
                key={a.id}
                alliance={a}
                total={r.total}
                rank={r.rank}
                prevRank={prevRanks ? prevRanks[a.id] ?? null : null}
                isLeader={leaderId === a.id && !isFinal}
                isWinner={winnerId === a.id}
                index={i}
              />
            );
          })}
        </div>
      </section>

      <Classification ranking={ranking} alliances={data.alliances} isFinal={isFinal} />

      <FeaturedActivity activity={featuredActivity} alliances={data.alliances} />

      <ResultsTable
        results={data.results}
        alliances={data.alliances}
        activities={data.activities}
      />

      <Program activities={data.activities} />

      <RainNoticeBlock notice={data.rainNotice} />

      <Footer />
    </div>
  );
}
