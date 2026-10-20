import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type {
  Activity,
  Alliance,
  ChangeLogEntry,
  EventState,
  RainNotice,
  ResultRow,
} from './types';
import {
  fetchActivities,
  fetchAlliances,
  fetchChangeLog,
  fetchEventState,
  fetchRainNotice,
  fetchResults,
} from './data';

export interface MarcadorData {
  alliances: Alliance[];
  activities: Activity[];
  results: ResultRow[];
  eventState: EventState | null;
  rainNotice: RainNotice | null;
  changeLog: ChangeLogEntry[];
  loading: boolean;
  error: string | null;
  refreshedAt: number;
}

export function useMarcadorData(): MarcadorData {
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [eventState, setEventState] = useState<EventState | null>(null);
  const [rainNotice, setRainNotice] = useState<RainNotice | null>(null);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<number>(Date.now());

  async function loadAll() {
    try {
      const [a, act, res, ev, rain, log] = await Promise.all([
        fetchAlliances(),
        fetchActivities(),
        fetchResults(),
        fetchEventState(),
        fetchRainNotice(),
        fetchChangeLog(50),
      ]);
      setAlliances(a);
      setActivities(act);
      setResults(res);
      setEventState(ev);
      setRainNotice(rain);
      setChangeLog(log);
      setError(null);
      setRefreshedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();

    const channel = supabase
      .channel('marcador-public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'results' },
        () => loadAll()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => loadAll()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_state' },
        () => loadAll()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rain_notice' },
        () => loadAll()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alliances' },
        () => loadAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    alliances,
    activities,
    results,
    eventState,
    rainNotice,
    changeLog,
    loading,
    error,
    refreshedAt,
  };
}
