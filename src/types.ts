export type LanguageCode = 'en' | 'bn' | 'hi' | 'ar' | 'es';
export type ThemeMode = '' | 'light' | 'dark';
export type HeroStyle = 'ring' | 'slim' | 'bars';
export type TaskCardStyle = 'classic' | 'compact' | 'tiles';
export type CardShape = 'square' | 'round' | 'pill';
export type ChartStyle = 'bar' | 'donut';
export type LessReasonKey = 'phone' | 'tired' | 'away' | 'sick' | 'distracted';
export type TabKey = 'home' | 'plan' | 'rep' | 'cal' | 'set' | 'bk';

export interface RoutineTask {
  id: number;
  name: string;
  planned: number; // minutes
}

export interface DayTaskLog {
  id: number;
  name: string;
  planned: number; // minutes
  actual: number | null; // minutes
  note?: string;
  rs?: LessReasonKey[];
}

export interface ExtraTime {
  name: string;
  m: number; // minutes
}

export interface DayLog {
  tasks: DayTaskLog[];
  extras?: ExtraTime[];
  note?: string;
}

export interface ActiveTimer {
  id: number;
  start: number; // epoch ms
}

export interface AppState {
  routine: RoutineTask[];
  logs: Record<string, DayLog>;
  nid: number;
  theme: ThemeMode;
  accent?: string;
  lang?: LanguageCode;
  country?: string;
  tz?: string;
  setup?: boolean;
  hs?: HeroStyle;
  ts?: TaskCardStyle;
  cs?: CardShape;
  cst?: ChartStyle;
  rp?: '7' | '30';
  goalH?: number;
  daily?: ExtraTime[];
  timer?: ActiveTimer | null;
}
