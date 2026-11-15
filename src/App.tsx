import { useEffect, useMemo, useState } from 'react';
import type { AppState, LessReasonKey, TabKey } from './types';
import { detectDefaultLanguage } from './data/i18n';
import {
  getTodayKey,
  loadState,
  loadWallpaper,
  normalizeActivityKey,
  saveState,
  saveWallpaper,
  syncLogForDate,
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { HomeView } from './components/HomeView';
import { RoutinePlanView } from './components/RoutinePlanView';
import { ReportView } from './components/ReportView';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { BackupView } from './components/BackupView';
import { CountryModal } from './components/CountryModal';
import { OfflineIndicator } from './components/OfflineIndicator';

function getTabFromHash(): TabKey {
  const hash = window.location.hash.slice(1);
  if (hash === 'plan' || hash === 'cal' || hash === 'bk' || hash === 'set' || hash === 'rep') {
    return hash;
  }
  return 'home';
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [wallpaper, setWallpaper] = useState<string>(() => loadWallpaper());
  const [activeTab, setActiveTab] = useState<TabKey>(() => getTabFromHash());
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const todayKey = useMemo(() => getTodayKey(state.tz), [state.tz, Math.floor(nowMs / 1000)]);

  // Sync today's log with routine whenever state or day rolls over
  const { state: syncedState, log: todayLog } = useMemo(
    () => syncLogForDate(state, todayKey),
    [state, todayKey],
  );

  // Persist state changes
  useEffect(() => {
    saveState(syncedState);
  }, [syncedState]);

  // Apply theme, accent, card shape, language, and RTL direction
  useEffect(() => {
    const root = document.documentElement;
    const effectiveLang = state.lang || detectDefaultLanguage();
    root.lang = effectiveLang;
    root.dir = effectiveLang === 'ar' ? 'rtl' : 'ltr';

    if (state.accent) {
      root.style.setProperty('--pri', state.accent);
      root.style.setProperty('--acc', state.accent);
    } else {
      root.style.removeProperty('--pri');
      root.style.removeProperty('--acc');
    }

    document.body.dataset.cs = state.cs || 'round';

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const applyDark = () => {
      const shouldDark =
        state.theme === 'dark' || (state.theme !== 'light' && mq.matches);
      root.classList.toggle('dark', shouldDark);
    };
    applyDark();
    mq.addEventListener('change', applyDark);
    return () => mq.removeEventListener('change', applyDark);
  }, [state.theme, state.accent, state.lang, state.cs]);

  // Live 1s tick for timer and midnight rollover
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Sync URL hash changes
  useEffect(() => {
    const onHash = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (next: TabKey) => {
    setActiveTab(next);
    try {
      window.location.hash = next === 'home' ? '' : next;
    } catch {
      // Ignore hash write restrictions
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateTodayLog = (updater: (log: typeof todayLog) => typeof todayLog) => {
    setState((prev) => {
      const { state: base, log } = syncLogForDate(prev, todayKey);
      const nextLog = updater(log);
      return {
        ...base,
        logs: {
          ...base.logs,
          [todayKey]: nextLog,
        },
      };
    });
  };

  const handleUpdateTaskActual = (taskIndex: number, minutes: number | null) => {
    updateTodayLog((log) => ({
      ...log,
      tasks: log.tasks.map((t, i) => (i === taskIndex ? { ...t, actual: minutes } : t)),
    }));
  };

  const handleMarkTaskFull = (taskIndex: number) => {
    updateTodayLog((log) => ({
      ...log,
      tasks: log.tasks.map((t, i) => (i === taskIndex ? { ...t, actual: t.planned } : t)),
    }));
  };

  const handleToggleTimer = (taskId: number) => {
    setState((prev) => {
      const { state: base, log } = syncLogForDate(prev, todayKey);
      const existingTimer = base.timer;
      let nextLog = log;

      // Stop currently running timer and log elapsed minutes if >= 20 seconds
      if (existingTimer) {
        const sec = (Date.now() - existingTimer.start) / 1000;
        const mins = sec >= 20 ? Math.max(1, Math.round(sec / 60)) : 0;
        if (mins > 0) {
          nextLog = {
            ...log,
            tasks: log.tasks.map((t) =>
              t.id === existingTimer.id ? { ...t, actual: (t.actual || 0) + mins } : t,
            ),
          };
        }
      }

      const nextTimer =
        existingTimer && existingTimer.id === taskId
          ? null
          : { id: taskId, start: Date.now() };

      return {
        ...base,
        timer: nextTimer,
        logs: {
          ...base.logs,
          [todayKey]: nextLog,
        },
      };
    });
  };

  const handleUpdateTaskNote = (taskIndex: number, note: string) => {
    updateTodayLog((log) => ({
      ...log,
      tasks: log.tasks.map((t, i) => (i === taskIndex ? { ...t, note } : t)),
    }));
  };

  const handleToggleReason = (taskIndex: number, reason: LessReasonKey) => {
    updateTodayLog((log) => ({
      ...log,
      tasks: log.tasks.map((t, i) => {
        if (i !== taskIndex) return t;
        const current = t.rs || [];
        const next = current.includes(reason)
          ? current.filter((r) => r !== reason)
          : [...current, reason];
        return { ...t, rs: next };
      }),
    }));
  };

  const handleUpdateDiary = (note: string) => {
    updateTodayLog((log) => ({ ...log, note }));
  };

  const handleAddExtra = (name: string, minutes: number) => {
    updateTodayLog((log) => ({
      ...log,
      extras: [...(log.extras || []), { name, m: minutes }],
    }));
  };

  const handleRemoveExtra = (index: number) => {
    updateTodayLog((log) => ({
      ...log,
      extras: (log.extras || []).filter((_, i) => i !== index),
    }));
  };

  const handleClearToday = () => {
    setState((prev) => {
      const nextLogs = { ...prev.logs };
      delete nextLogs[todayKey];
      return { ...prev, logs: nextLogs };
    });
  };

  const handleAddRoutineTask = (name: string, planned: number) => {
    setState((prev) => ({
      ...prev,
      routine: [...prev.routine, { id: prev.nid, name, planned }],
      nid: prev.nid + 1,
    }));
  };

  const handleUpdateRoutineTask = (index: number, patch: { name?: string; planned?: number }) => {
    setState((prev) => ({
      ...prev,
      routine: prev.routine.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  };

  const handleDeleteRoutineTask = (index: number) => {
    setState((prev) => ({
      ...prev,
      routine: prev.routine.filter((_, i) => i !== index),
    }));
  };

  const handleAddDailyFixed = (name: string, m: number) => {
    setState((prev) => {
      const nextDaily = [...(prev.daily || []), { name, m }];
      const { state: base, log } = syncLogForDate(prev, todayKey);
      const extras = [...(log.extras || [])];
      if (!extras.some((x) => normalizeActivityKey(x.name) === normalizeActivityKey(name))) {
        extras.push({ name, m });
      }
      return {
        ...base,
        daily: nextDaily,
        logs: {
          ...base.logs,
          [todayKey]: { ...log, extras },
        },
      };
    });
  };

  const handleDeleteDailyFixed = (index: number) => {
    setState((prev) => ({
      ...prev,
      daily: (prev.daily || []).filter((_, i) => i !== index),
    }));
  };

  const handleSetWallpaper = (dataUrl: string) => {
    const ok = saveWallpaper(dataUrl);
    if (ok) setWallpaper(dataUrl);
    return ok;
  };

  const hasWallpaper = Boolean(wallpaper);

  return (
    <div
      className={`min-h-screen transition-colors ${
        hasWallpaper
          ? 'text-slate-900 dark:text-slate-100'
          : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Optional custom gallery wallpaper backdrop with contrast scrim */}
      {hasWallpaper && (
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.42), rgba(15,23,42,0.42)), url(${wallpaper})`,
          }}
        />
      )}

      <TopBar
        activeTab={activeTab}
        onNavigate={navigate}
        onClearToday={handleClearToday}
        lang={syncedState.lang}
        hasWallpaper={hasWallpaper}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <HomeView
            state={syncedState}
            todayLog={todayLog}
            nowMs={nowMs}
            hasWallpaper={hasWallpaper}
            onUpdateTaskActual={handleUpdateTaskActual}
            onMarkTaskFull={handleMarkTaskFull}
            onToggleTimer={handleToggleTimer}
            onUpdateTaskNote={handleUpdateTaskNote}
            onToggleReason={handleToggleReason}
            onUpdateDiary={handleUpdateDiary}
            onAddExtra={handleAddExtra}
            onRemoveExtra={handleRemoveExtra}
            onUpdateLayout={(patch) => setState((prev) => ({ ...prev, ...patch }))}
            onNavigate={navigate}
            onOpenCountryPicker={() => setCountryModalOpen(true)}
            onDismissSetupBanner={() => setState((prev) => ({ ...prev, setup: true }))}
            onClearToday={handleClearToday}
          />
        )}

        {activeTab === 'plan' && (
          <RoutinePlanView
            state={syncedState}
            hasWallpaper={hasWallpaper}
            onAddRoutineTask={handleAddRoutineTask}
            onUpdateRoutineTask={handleUpdateRoutineTask}
            onDeleteRoutineTask={handleDeleteRoutineTask}
            onAddDailyFixed={handleAddDailyFixed}
            onDeleteDailyFixed={handleDeleteDailyFixed}
          />
        )}

        {activeTab === 'rep' && (
          <ReportView
            state={syncedState}
            todayKey={todayKey}
            hasWallpaper={hasWallpaper}
            onChangePeriod={(rp) => setState((prev) => ({ ...prev, rp }))}
            onSetWeeklyGoal={(goalH) => setState((prev) => ({ ...prev, goalH }))}
          />
        )}

        {activeTab === 'cal' && (
          <CalendarView
            state={syncedState}
            todayKey={todayKey}
            hasWallpaper={hasWallpaper}
          />
        )}

        {activeTab === 'set' && (
          <SettingsView
            state={syncedState}
            todayLog={todayLog}
            wallpaper={wallpaper}
            onUpdateState={(patch) => setState((prev) => ({ ...prev, ...patch }))}
            onSetWallpaper={handleSetWallpaper}
            onOpenCountryPicker={() => setCountryModalOpen(true)}
          />
        )}

        {activeTab === 'bk' && (
          <BackupView
            state={syncedState}
            todayKey={todayKey}
            hasWallpaper={hasWallpaper}
            onRestoreState={(next) => setState(next)}
          />
        )}
      </main>

      {countryModalOpen && (
        <CountryModal
          currentCountry={syncedState.country}
          currentTz={syncedState.tz}
          lang={syncedState.lang}
          onApply={(country, tz, suggestedLang) => {
            setState((prev) => ({
              ...prev,
              country,
              tz,
              setup: true,
              lang: suggestedLang || prev.lang,
            }));
            setCountryModalOpen(false);
          }}
          onUsePhoneSettings={() => {
            setState((prev) => ({ ...prev, setup: true }));
            setCountryModalOpen(false);
          }}
          onClose={() => setCountryModalOpen(false)}
        />
      )}
      <OfflineIndicator />
    </div>
  );
}
