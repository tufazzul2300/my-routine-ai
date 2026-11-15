import type { AppState, DayLog, DayTaskLog } from '../types';

export const STORAGE_KEY = 'routine-app-v1';
export const WALLPAPER_KEY = 'routine-wall';

export const TASK_PALETTE = [
  '#4f46e5',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
];

export const EXTRA_COLORS = ['#94a3b8', '#f97316', '#a855f7', '#eab308', '#06b6d4', '#84cc16'];
export const ACCENT_SWATCHES = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function getTaskColor(id: number): string {
  return TASK_PALETTE[Math.abs(id) % TASK_PALETTE.length];
}

export function getDefaultState(): AppState {
  return {
    routine: [
      { id: 1, name: 'Study', planned: 120 },
      { id: 2, name: 'Prayer/Rest', planned: 30 },
    ],
    logs: {},
    nid: 3,
    theme: '',
    hs: 'ring',
    ts: 'classic',
    cs: 'round',
    cst: 'bar',
    rp: '7',
  };
}

export function migrateState(raw: Partial<AppState>): AppState {
  const base = getDefaultState();
  const state: AppState = {
    ...base,
    ...raw,
    routine: Array.isArray(raw.routine) ? raw.routine : base.routine,
    logs: raw.logs && typeof raw.logs === 'object' ? raw.logs : {},
    nid: typeof raw.nid === 'number' ? raw.nid : 3,
  };

  Object.values(state.logs).forEach((log) => {
    if (!log || !Array.isArray(log.tasks)) return;
    log.tasks.forEach((task) => {
      if (task.id == null) {
        const match = state.routine.find((r) => r.name === task.name);
        task.id = match ? match.id : -1;
      }
    });
  });

  return state;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    return migrateState(JSON.parse(raw));
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadWallpaper(): string {
  try {
    return localStorage.getItem(WALLPAPER_KEY) || '';
  } catch {
    return '';
  }
}

export function saveWallpaper(dataUrl: string): boolean {
  try {
    if (!dataUrl) {
      localStorage.removeItem(WALLPAPER_KEY);
    } else {
      localStorage.setItem(WALLPAPER_KEY, dataUrl);
    }
    return true;
  } catch {
    return false;
  }
}

export function getTodayKey(tz?: string): string {
  try {
    const tf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = Object.fromEntries(tf.formatToParts(new Date()).map((x) => [x.type, x.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

export function syncLogForDate(state: AppState, dateKey: string): { state: AppState; log: DayLog } {
  const existing = state.logs[dateKey];
  const log: DayLog = existing
    ? {
        ...existing,
        tasks: [...(existing.tasks || [])].map((t) => ({ ...t })),
        extras: existing.extras ? [...existing.extras] : undefined,
      }
    : {
        tasks: [],
        extras: (state.daily || []).map((x) => ({ name: x.name, m: x.m })),
      };

  // Keep tasks that either have actual logged time or still exist in routine
  log.tasks = log.tasks.filter(
    (t) => t.actual != null || state.routine.some((r) => r.id === t.id),
  );

  for (const r of state.routine) {
    const found = log.tasks.find((t) => t.id === r.id);
    if (!found) {
      log.tasks.push({ id: r.id, name: r.name, planned: r.planned, actual: null });
    } else {
      found.name = r.name;
      if (found.actual == null) {
        found.planned = r.planned;
      }
    }
  }

  return {
    state: {
      ...state,
      logs: {
        ...state.logs,
        [dateKey]: log,
      },
    },
    log,
  };
}

export function calculateTotals(log?: DayLog | null): { p: number; a: number; all: number } {
  if (!log || !log.tasks) return { p: 0, a: 0, all: 0 };
  const done = log.tasks.filter((t) => t.actual != null);
  return {
    p: done.reduce((s, t) => s + t.planned, 0),
    a: done.reduce((s, t) => s + (t.actual || 0), 0),
    all: log.tasks.reduce((s, t) => s + t.planned, 0),
  };
}

export function getTaskProgressPct(task: DayTaskLog): number {
  if (task.actual == null || task.planned <= 0) return 0;
  return Math.min(100, Math.round((task.actual / task.planned) * 100));
}

export function addDaysToKey(dateKey: string, delta: number): string {
  const dt = new Date(new Date(`${dateKey}T12:00:00Z`).getTime() + delta * 86400000);
  return dt.toISOString().slice(0, 10);
}

export function getRecentDayKeys(count: number, todayKey: string): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    keys.push(addDaysToKey(todayKey, -i));
  }
  return keys;
}

export function getMetDaysSet(logs: Record<string, DayLog>): Set<string> {
  const met = new Set<string>();
  for (const key of Object.keys(logs)) {
    const totals = calculateTotals(logs[key]);
    if (totals.all > 0 && totals.a >= totals.all) {
      met.add(key);
    }
  }
  return met;
}

export function calculateStreaks(logs: Record<string, DayLog>, todayKey: string): { best: number; cur: number } {
  const met = getMetDaysSet(logs);
  let best = 0;
  for (const k of [...met].sort()) {
    if (!met.has(addDaysToKey(k, -1))) {
      let run = 0;
      let cursor = k;
      while (met.has(cursor)) {
        run++;
        cursor = addDaysToKey(cursor, 1);
      }
      if (run > best) best = run;
    }
  }

  let cur = 0;
  let cursor = met.has(todayKey) ? todayKey : addDaysToKey(todayKey, -1);
  while (met.has(cursor)) {
    cur++;
    cursor = addDaysToKey(cursor, -1);
  }

  return { best, cur };
}

export function normalizeActivityKey(name: string): string {
  return String(name).trim().toLowerCase();
}

export interface ExtraGroup {
  key: string;
  name: string;
  totalMinutes: number;
  parts: { index: number; m: number }[];
}

export function groupExtras(log?: DayLog | null): ExtraGroup[] {
  const groups: ExtraGroup[] = [];
  const idxMap: Record<string, number> = {};
  (log?.extras || []).forEach((item, index) => {
    const k = normalizeActivityKey(item.name);
    if (idxMap[k] == null) {
      idxMap[k] = groups.length;
      groups.push({ key: k, name: item.name, totalMinutes: 0, parts: [] });
    }
    const g = groups[idxMap[k]];
    g.totalMinutes += item.m;
    g.parts.push({ index, m: item.m });
  });
  return groups;
}

export function formatTimerHMS(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function resizeWallpaperFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode_failed'));
      img.onload = () => {
        const scale = Math.min(1, 1080 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas_failed'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
