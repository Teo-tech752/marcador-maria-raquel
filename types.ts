export type AllianceCode = 'amarilla' | 'verde' | 'azul';

export interface Alliance {
  id: string;
  code: AllianceCode;
  name: string;
  color_hex: string;
  accent_hex: string;
  created_at: string;
}

export type ActivityDay =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves_manana'
  | 'jueves_tarde'
  | 'viernes';

export type ActivityStatus =
  | 'pendiente'
  | 'en_desarrollo'
  | 'finalizada'
  | 'suspendida';

export interface Activity {
  id: string;
  day: ActivityDay;
  title: string;
  location: string | null;
  scheduled_time: string | null;
  order_index: number;
  status: ActivityStatus;
  is_highlighted: boolean;
  created_at: string;
}

export interface ResultRow {
  id: string;
  activity_id: string;
  alliance_id: string;
  points: number;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  activity?: Activity;
  alliance?: Alliance;
}

export type EventStatus = 'en_desarrollo' | 'pausado' | 'finalizado';

export interface EventState {
  id: number;
  status: EventStatus;
  winner_alliance_id: string | null;
  featured_activity_id: string | null;
  last_updated_at: string;
  updated_by: string | null;
}

export interface RainNotice {
  id: number;
  text: string;
  is_visible: boolean;
  updated_at: string;
}

export interface ChangeLogEntry {
  id: string;
  action: string;
  description: string;
  payload: Record<string, unknown> | null;
  actor_email: string | null;
  created_at: string;
}

export interface AllianceWithScore extends Alliance {
  total: number;
  rank: number;
  prevRank: number | null;
}

export const DAY_LABELS: Record<ActivityDay, string> = {
  lunes: 'Lunes 19 de octubre',
  martes: 'Martes 20 de octubre',
  miercoles: 'Miércoles 21 de octubre',
  jueves_manana: 'Jueves 22 de octubre — Mañana',
  jueves_tarde: 'Jueves 22 de octubre — Tarde',
  viernes: 'Viernes 23 de octubre',
};

export const DAY_ORDER: ActivityDay[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves_manana',
  'jueves_tarde',
  'viernes',
];

export const STATUS_LABELS: Record<ActivityStatus, string> = {
  pendiente: 'Pendiente',
  en_desarrollo: 'En desarrollo',
  finalizada: 'Finalizada',
  suspendida: 'Suspendida / modificada',
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  en_desarrollo: 'EN DESARROLLO',
  pausado: 'PAUSADO',
  finalizado: 'FINALIZADO',
};
