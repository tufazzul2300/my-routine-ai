import React, { useState } from 'react';
import { Check, Edit3, Globe, Trash2, X } from 'lucide-react';
import type {
  AppState,
  CardShape,
  ChartStyle,
  DayLog,
  HeroStyle,
  LessReasonKey,
  TabKey,
  TaskCardStyle,
} from '../types';
import { tr } from '../data/i18n';
import { HeroCard } from './HeroCard';
import { TaskCard } from './TaskCard';
import { TwentyFourHourChart, TwentyFourHourModal } from './TwentyFourHourChart';
import { PWAInstallButton } from './PWAInstallButton';

interface HomeViewProps {
  state: AppState;
  todayLog: DayLog;
  nowMs: number;
  hasWallpaper: boolean;
  onUpdateTaskActual: (taskIndex: number, minutes: number | null) => void;
  onMarkTaskFull: (taskIndex: number) => void;
  onToggleTimer: (taskId: number) => void;
  onUpdateTaskNote: (taskIndex: number, note: string) => void;
  onToggleReason: (taskIndex: number, reason: LessReasonKey) => void;
  onUpdateDiary: (note: string) => void;
  onAddExtra: (name: string, minutes: number) => void;
  onRemoveExtra: (index: number) => void;
  onUpdateLayout: (patch: Partial<Pick<AppState, 'hs' | 'ts' | 'cs' | 'cst'>>) => void;
  onNavigate: (tab: TabKey) => void;
  onOpenCountryPicker: () => void;
  onDismissSetupBanner: () => void;
  onClearToday: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  todayLog,
  nowMs,
  hasWallpaper,
  onUpdateTaskActual,
  onMarkTaskFull,
  onToggleTimer,
  onUpdateTaskNote,
  onToggleReason,
  onUpdateDiary,
  onAddExtra,
  onRemoveExtra,
  onUpdateLayout,
  onNavigate,
  onOpenCountryPicker,
  onDismissSetupBanner,
  onClearToday,
}) => {
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [armedClear, setArmedClear] = useState(false);

  const lang = state.lang;
  const headingClass = hasWallpaper
    ? 'font-display text-base sm:text-lg font-bold text-white drop-shadow-sm'
    : 'font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100';

  const heroOptions: [HeroStyle, string][] = [
    ['ring', tr('ring', lang)],
    ['slim', tr('slim', lang)],
    ['bars', tr('bars', lang)],
  ];
  const taskOptions: [TaskCardStyle, string][] = [
    ['classic', tr('classic', lang)],
    ['compact', tr('compact', lang)],
    ['tiles', tr('tiles', lang)],
  ];
  const shapeOptions: [CardShape, string][] = [
    ['square', tr('square', lang)],
    ['round', tr('rounded', lang)],
    ['pill', tr('pill', lang)],
  ];
  const chartOptions: [ChartStyle, string][] = [
    ['bar', tr('bar', lang)],
    ['donut', tr('donut', lang)],
  ];

  const handleDesktopClear = () => {
    if (!armedClear) {
      setArmedClear(true);
      return;
    }
    onClearToday();
    setArmedClear(false);
  };

  return (
    <div className="space-y-6">
      {/* Non-blocking Country & Timezone Setup Banner on first visit */}
      {!state.setup && (
        <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[var(--pri)]">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {tr('chooseCountryTitle', lang)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {tr('chooseCountryDesc', lang)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCountryPicker}
              className="min-h-[40px] px-3.5 py-2 rounded-lg bg-[var(--pri)] text-white text-xs sm:text-sm font-medium hover:opacity-90 whitespace-nowrap cursor-pointer"
            >
              {tr('countryAndTime', lang)}
            </button>
            <button
              type="button"
              onClick={onDismissSetupBanner}
              className="min-h-[40px] px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              {tr('skipPhoneSettings', lang)}
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Grid: Single column on mobile, 12-col split on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Primary Column: Hero + Tasks */}
        <div className="lg:col-span-7 space-y-6">
          <HeroCard
            log={todayLog}
            heroStyle={state.hs || 'ring'}
            lang={lang}
            tz={state.tz}
            onOpenLayout={() => setLayoutModalOpen(true)}
          />

          <section aria-labelledby="todays-tasks-heading">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 id="todays-tasks-heading" className={headingClass}>
                {tr('todaysTasks', lang)}
              </h2>
              <div className="flex items-center gap-2">
                <PWAInstallButton />
                <button
                  type="button"
                  onClick={handleDesktopClear}
                  className={`hidden md:inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    armedClear
                      ? 'bg-red-600 text-white'
                      : hasWallpaper
                        ? 'bg-white/90 dark:bg-slate-900/90 text-red-600 dark:text-red-400 hover:bg-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{armedClear ? tr('sureTapAgain', lang) : tr('clearToday', lang)}</span>
                </button>
              </div>
            </div>

            {!todayLog.tasks.length ? (
              <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-sm text-slate-600 dark:text-slate-400">
                <p>{tr('noTasksHome', lang)}</p>
                <button
                  type="button"
                  onClick={() => onNavigate('plan')}
                  className="mt-3 min-h-[40px] px-4 py-2 rounded-lg bg-[var(--pri)] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
                >
                  {tr('myRoutine', lang)}
                </button>
              </div>
            ) : (
              <div
                className={
                  state.ts === 'tiles'
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5'
                    : 'space-y-3.5'
                }
              >
                {todayLog.tasks.map((task, idx) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    cardStyle={state.ts || 'classic'}
                    lang={lang}
                    timer={state.timer}
                    nowMs={nowMs}
                    onUpdateActual={(m) => onUpdateTaskActual(idx, m)}
                    onMarkFull={() => onMarkTaskFull(idx)}
                    onToggleTimer={() => onToggleTimer(task.id)}
                    onUpdateNote={(note) => onUpdateTaskNote(idx, note)}
                    onToggleReason={(reason) => onToggleReason(idx, reason)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right/Secondary Column: 24-Hour Chart + Today's Diary */}
        <div className="lg:col-span-5 space-y-6">
          <section aria-labelledby="chart-24h-heading">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 id="chart-24h-heading" className={headingClass}>
                {tr('chart24h', lang)}
              </h2>
              <button
                type="button"
                onClick={() => setChartModalOpen(true)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  hasWallpaper
                    ? 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{tr('tapToEditTime', lang)}</span>
              </button>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setChartModalOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setChartModalOpen(true);
                }
              }}
              className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-[var(--pri)]/50 transition-colors cursor-pointer"
            >
              <TwentyFourHourChart log={todayLog} chartStyle={state.cst || 'bar'} lang={lang} />
            </div>
          </section>

          <section aria-labelledby="todays-diary-heading">
            <h2 id="todays-diary-heading" className={`${headingClass} mb-3`}>
              {tr('todaysDiary', lang)}
            </h2>
            <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <textarea
                rows={4}
                value={todayLog.note || ''}
                onChange={(e) => onUpdateDiary(e.target.value)}
                placeholder={tr('diaryPlaceholder', lang)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--pri)] resize-y"
              />
            </div>
          </section>
        </div>
      </div>

      {/* 24-Hour Chart Editor Sheet / Modal */}
      {chartModalOpen && (
        <TwentyFourHourModal
          log={todayLog}
          chartStyle={state.cst || 'bar'}
          lang={lang}
          onAddExtra={onAddExtra}
          onRemoveExtra={onRemoveExtra}
          onClose={() => setChartModalOpen(false)}
        />
      )}

      {/* Quick Layout Drawer / Modal */}
      {layoutModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLayoutModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 pb-safe shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {tr('layout', lang)}
              </h2>
              <button
                type="button"
                onClick={() => setLayoutModalOpen(false)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[var(--pri)] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{tr('save', lang)}</span>
              </button>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                {tr('topCard', lang)}
              </div>
              <div className="flex flex-wrap gap-2">
                {heroOptions.map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateLayout({ hs: val })}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                      (state.hs || 'ring') === val
                        ? 'bg-[var(--pri)] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                {tr('taskCards', lang)}
              </div>
              <div className="flex flex-wrap gap-2">
                {taskOptions.map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateLayout({ ts: val })}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                      (state.ts || 'classic') === val
                        ? 'bg-[var(--pri)] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                {tr('cardShape', lang)}
              </div>
              <div className="flex flex-wrap gap-2">
                {shapeOptions.map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateLayout({ cs: val })}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                      (state.cs || 'round') === val
                        ? 'bg-[var(--pri)] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                {tr('chart', lang)}
              </div>
              <div className="flex flex-wrap gap-2">
                {chartOptions.map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateLayout({ cst: val })}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                      (state.cst || 'bar') === val
                        ? 'bg-[var(--pri)] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLayoutModalOpen(false)}
              className="w-full min-h-[42px] py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium inline-flex items-center justify-center gap-1.5 sm:hidden"
            >
              <X className="w-4 h-4" />
              <span>{tr('save', lang)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
