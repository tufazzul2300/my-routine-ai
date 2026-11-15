import React, { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { DayLog, HeroStyle, LanguageCode } from '../types';
import { formatDuration, formatNum, getLocale, tr } from '../data/i18n';
import { calculateTotals, getTaskColor, getTaskProgressPct } from '../utils/storage';

interface HeroCardProps {
  log: DayLog;
  heroStyle?: HeroStyle;
  lang?: LanguageCode;
  tz?: string;
  onOpenLayout?: () => void;
  previewMode?: boolean;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  log,
  heroStyle = 'ring',
  lang,
  tz,
  onOpenLayout,
  previewMode = false,
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (previewMode) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [previewMode]);

  const locale = getLocale(lang);
  let timeText = '';
  let dateText = '';
  try {
    timeText = now.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZone: tz || undefined,
    });
    dateText = now.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: tz || undefined,
    });
  } catch {
    timeText = now.toLocaleTimeString(locale);
    dateText = now.toLocaleDateString(locale);
  }

  const totals = calculateTotals(log);
  const diff = totals.all - totals.a;
  const pct = totals.all > 0 ? Math.round((totals.a / totals.all) * 100) : 0;

  if (heroStyle === 'bars') {
    return (
      <div className="routine-card relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        {onOpenLayout && (
          <button
            type="button"
            onClick={onOpenLayout}
            aria-label={tr('layout', lang)}
            className="absolute top-4 end-4 min-h-[40px] min-w-[40px] px-2.5 flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline whitespace-nowrap">{tr('layout', lang)}</span>
          </button>
        )}

        <div className="font-mono-num text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 pe-14">
          {timeText}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{dateText}</div>

        <div className="mt-5 space-y-3">
          {log.tasks.map((task) => {
            const width = getTaskProgressPct(task);
            const color = getTaskColor(task.id);
            return (
              <div key={task.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {task.name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                    {formatDuration(task.actual || 0, lang)} / {formatDuration(task.planned, lang)}
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${width}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">{tr('done', lang)}</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatDuration(totals.a, lang)} / {formatDuration(totals.all, lang)} · {formatNum(pct, lang)}%
          </span>
        </div>
      </div>
    );
  }

  // Ring or Slim gradient hero card
  const scale = Math.max(totals.all, totals.a) || 1;
  const circumference = 339.29;
  let offset = 0;

  return (
    <div className="routine-hero relative text-white p-5 sm:p-6 shadow-md">
      {onOpenLayout && (
        <button
          type="button"
          onClick={onOpenLayout}
          aria-label={tr('layout', lang)}
          className="absolute top-4 end-4 min-h-[40px] min-w-[40px] px-2.5 flex items-center justify-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium backdrop-blur-sm transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline whitespace-nowrap">{tr('layout', lang)}</span>
        </button>
      )}

      <div className="font-mono-num text-2xl sm:text-3xl font-bold tracking-tight pe-16">
        {timeText}
      </div>
      <div className="text-sm text-white/80 mt-0.5">{dateText}</div>

      {heroStyle === 'slim' ? (
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-num text-3xl font-bold">{formatNum(pct, lang)}%</span>
              <span className="text-sm text-white/85">{tr('done', lang)}</span>
            </div>
            <span className="text-sm text-white/90 tabular-nums">
              {diff > 0 ? tr('left', lang) : tr('over', lang)} {formatDuration(Math.abs(diff), lang)}
            </span>
          </div>
          <div className="mt-2.5 h-3 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-200"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-white/85 tabular-nums">
            {formatDuration(totals.a, lang)} / {formatDuration(totals.all, lang)}
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between sm:justify-around gap-6">
          <svg viewBox="0 0 140 140" className="w-32 h-32 sm:w-36 sm:h-36 shrink-0">
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="15"
            />
            {log.tasks.map((task) => {
              const actual = task.actual || 0;
              if (!actual) return null;
              const len = (actual / scale) * circumference;
              const dashOffset = -offset;
              offset += len;
              return (
                <circle
                  key={task.id}
                  cx="70"
                  cy="70"
                  r="54"
                  fill="none"
                  stroke={getTaskColor(task.id)}
                  strokeWidth="15"
                  strokeDasharray={`${len} ${Math.max(0, circumference - len)}`}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 70 70)"
                />
              );
            })}
            <text
              x="70"
              y="68"
              textAnchor="middle"
              fontSize="23"
              fontWeight="700"
              fill="#ffffff"
              className="font-mono-num"
            >
              {formatNum(pct, lang)}%
            </text>
            <text
              x="70"
              y="88"
              textAnchor="middle"
              fontSize="11"
              fill="rgba(255,255,255,0.82)"
            >
              {tr('complete', lang)}
            </text>
          </svg>

          <div className="grid grid-cols-1 gap-2.5 min-w-0">
            <div>
              <div className="text-xs text-white/75">{tr('done', lang)}</div>
              <div className="text-base sm:text-lg font-semibold tabular-nums">
                {formatDuration(totals.a, lang)}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/75">{tr('planned', lang)}</div>
              <div className="text-base sm:text-lg font-semibold tabular-nums">
                {formatDuration(totals.all, lang)}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/75">
                {diff > 0 ? tr('left', lang) : tr('over', lang)}
              </div>
              <div className="text-base sm:text-lg font-semibold tabular-nums">
                {formatDuration(Math.abs(diff), lang)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
