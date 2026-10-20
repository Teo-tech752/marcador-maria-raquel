import { supabase } from './supabase';
import type {
  Activity,
  Alliance,
  ChangeLogEntry,
  EventState,
  RainNotice,
  ResultRow,
} from './types';

export async function fetchAlliances(): Promise<Alliance[]> {
  const { data, error } = await supabase
    .from('alliances')
    .select('*')
    .order('code');
  if (error) throw error;
  return data ?? [];
}

export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('day')
    .order('order_index');
  if (error) throw error;
  return data ?? [];
}

export async function fetchResults(): Promise<ResultRow[]> {
  const { data, error } = await supabase
    .from('results')
    .select(
      'id, activity_id, alliance_id, points, notes, recorded_at, created_at, activity:activities(*), alliance:alliances(*)'
    )
    .order('recorded_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ResultRow[];
}

export async function fetchEventState(): Promise<EventState | null> {
  const { data, error } = await supabase
    .from('event_state')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchRainNotice(): Promise<RainNotice | null> {
  const { data, error } = await supabase
    .from('rain_notice')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchChangeLog(limit = 50): Promise<ChangeLogEntry[]> {
  const { data, error } = await supabase
    .from('change_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export interface ScoresByAlliance {
  [allianceId: string]: number;
}

export function computeTotals(
  results: ResultRow[],
  alliances: Alliance[]
): ScoresByAlliance {
  const totals: ScoresByAlliance = {};
  for (const a of alliances) totals[a.id] = 0;
  for (const r of results) {
    if (totals[r.alliance_id] === undefined) totals[r.alliance_id] = 0;
    totals[r.alliance_id] += r.points;
  }
  return totals;
}

export interface RankedAlliance {
  alliance: Alliance;
  total: number;
  rank: number; // 1-based; ties share rank
  isTie: boolean;
  diffToFirst: number;
  diffToNext: number | null;
}

export function computeRanking(
  results: ResultRow[],
  alliances: Alliance[]
): RankedAlliance[] {
  const totals = computeTotals(results, alliances);
  const rows = alliances.map((a) => ({ alliance: a, total: totals[a.id] ?? 0 }));
  rows.sort((x, y) => y.total - x.total);

  const ranked: RankedAlliance[] = [];
  for (let i = 0; i < rows.length; i++) {
    const prev = i > 0 ? rows[i - 1] : null;
    const next = i < rows.length - 1 ? rows[i + 1] : null;
    const isTie = prev !== null && prev.total === rows[i].total;
    const rank = isTie ? ranked[i - 1].rank : i + 1;
    ranked.push({
      alliance: rows[i].alliance,
      total: rows[i].total,
      rank,
      isTie,
      diffToFirst: rows[0].total - rows[i].total,
      diffToNext: next ? rows[i].total - next.total : null,
    });
  }
  return ranked;
}
