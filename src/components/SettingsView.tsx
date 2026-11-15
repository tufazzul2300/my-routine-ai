import React, { useState } from 'react';
import { Globe, ImagePlus, Trash2 } from 'lucide-react';
import type {
  AppState,
  CardShape,
  ChartStyle,
  DayLog,
  HeroStyle,
  LanguageCode,
  TaskCardStyle,
  ThemeMode,
} from '../types';
import { getCityFromTimezone, getCountryDisplayName } from '../data/countries';
import { detectDefaultLanguage, getLocale, LANGUAGES, tr } from '../data/i18n';
import { ACCENT_SWATCHES, resizeWallpaperFile } from '../utils/storage';
import { HeroCard } from './HeroCard';
import { TaskCard } from './TaskCard';
import { TwentyFourHourChart } from './TwentyFourHourChart';

interface SettingsViewProps {
  state: AppState;
  todayLog: DayLog;
  wallpaper: string;
  onUpdateState: (patch: Partial<AppState>) => void;
  onSetWallpaper: (dataUrl: string) => boolean;
  onOpenCountryPicker: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  todayLog,
  wallpaper,
  onUpdateState,
  onSetWallpaper,
  onOpenCountryPicker,
}) => {
  const [photoMsg, setPhotoMsg] = useState('');
  const lang = state.lang;
  const activeLang = lang || detectDefaultLanguage();
  const locale = getLocale(lang);
  const hasWallpaper = Boolean(wallpaper);

  const headingClass = hasWallpaper
    ? 'font-display text-base sm:text-lg font-bold text-white drop-shadow-sm'
    : 'font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100';

  const sampleLog: DayLog =
    todayLog.tasks.length >= 2 && todayLog.tasks.some((t) => (t.actual || 0) > 0)
      ? todayLog
      : {
          tasks: [
            { id: 1, name: 'Study', planned: 120, actual: 75 },
            { id: 2, name: 'Video editing', planned: 60, actual: 30 },
            { id: 3, name: 'AI skills', planned: 90, actual: null },
          ],
          extras: [
            { name: tr('sleep', lang), m: 420 },
            { name: tr('meals', lang), m: 90 },
          ],
        };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeWallpaperFile(file);
      const saved = onSetWallpaper(dataUrl);
      setPhotoMsg(saved ? tr('photoSetOk', lang) : tr('photoTooLarge', lang));
    } catch {
      setPhotoMsg(tr('photoTooLarge', lang));
    }
  };

  const handleRemovePhoto = () => {
    onSetWallpaper('');
    setPhotoMsg('');
  };

  const themeOptions: [ThemeMode, string][] = [
    ['', tr('auto', lang)],
    ['light', tr('light', lang)],
    ['dark', tr('dark', lang)],
  ];

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

  const noop = () => {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left column: Theme, Accent, Photo, Language, Country */}
      <div className="lg:col-span-5 space-y-6">
        <section>
          <h2 className={`${headingClass} mb-3`}>{tr('theme', lang)}</h2>
          <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
            <div className="flex flex-wrap gap-2">
              {themeOptions.map(([val, label]) => (
                <button
                  key={val || 'auto'}
                  type="button"
                  onClick={() => onUpdateState({ theme: val })}
                  className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    (state.theme || '') === val
                      ? 'bg-[var(--pri)] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2.5">
                {tr('accentColor', lang)}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {ACCENT_SWATCHES.map((color) => {
                  const selected = state.accent === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Accent ${color}`}
                      onClick={() => onUpdateState({ accent: selected ? '' : color })}
                      className={`w-10 h-10 rounded-full border-3 transition-transform cursor-pointer ${
                        selected
                          ? 'border-slate-900 dark:border-white scale-105'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2.5">
                {tr('ownPhoto', lang)}
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium inline-flex items-center gap-2 cursor-pointer">
                  <ImagePlus className="w-4 h-4" />
                  <span>{tr('ownPhoto', lang).split('(')[0].trim()}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {hasWallpaper && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 hover:bg-red-100 dark:hover:bg-red-950/80 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{tr('removePhoto', lang)}</span>
                  </button>
                )}
              </div>
              {photoMsg && (
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">{photoMsg}</div>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className={`${headingClass} mb-3`}>{tr('language', lang)}</h2>
          <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(LANGUAGES) as LanguageCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onUpdateState({ lang: code })}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    activeLang === code
                      ? 'bg-[var(--pri)] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {LANGUAGES[code]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className={`${headingClass} mb-3`}>{tr('countryAndTime', lang)}</h2>
          <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe className="w-4 h-4 text-[var(--pri)] shrink-0" />
              <span className="text-sm text-slate-800 dark:text-slate-200 truncate">
                {state.country
                  ? `${getCountryDisplayName(state.country, locale)} · ${getCityFromTimezone(state.tz || '')}`
                  : tr('phoneSettings', lang)}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenCountryPicker}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium shrink-0 cursor-pointer"
            >
              {tr('change', lang)}
            </button>
          </div>
        </section>
      </div>

      {/* Right column: Layout options with Live Preview */}
      <div className="lg:col-span-7 space-y-6">
        <h2 className={headingClass}>{tr('layout', lang)}</h2>

        <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6">
          {/* Top card */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {tr('topCard', lang)}
            </div>
            <div className="pointer-events-none select-none">
              <HeroCard
                log={sampleLog}
                heroStyle={state.hs || 'ring'}
                lang={lang}
                tz={state.tz}
                previewMode
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {heroOptions.map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onUpdateState({ hs: val })}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
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

          {/* Task cards */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {tr('taskCards', lang)}
            </div>
            <div
              className={`pointer-events-none select-none ${
                state.ts === 'tiles' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'
              }`}
            >
              {sampleLog.tasks.slice(0, 2).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  cardStyle={state.ts || 'classic'}
                  lang={lang}
                  onUpdateActual={noop}
                  onMarkFull={noop}
                  onToggleTimer={noop}
                  onUpdateNote={noop}
                  onToggleReason={noop}
                  previewMode
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {taskOptions.map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onUpdateState({ ts: val })}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
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

          {/* Card shape */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {tr('cardShape', lang)}
            </div>
            <div className="routine-card bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 pointer-events-none">
              <span className="w-3 h-3 rounded-full bg-[var(--pri)] shrink-0" />
              <div className="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-[var(--pri)]" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {shapeOptions.map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onUpdateState({ cs: val })}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
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

          {/* Chart */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {tr('chart', lang)}
            </div>
            <div className="routine-card bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 pointer-events-none">
              <TwentyFourHourChart
                log={sampleLog}
                chartStyle={state.cst || 'bar'}
                lang={lang}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {chartOptions.map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onUpdateState({ cst: val })}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
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
        </div>
      </div>
    </div>
  );
};
