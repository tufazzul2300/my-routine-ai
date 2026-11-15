import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import type { AppState } from '../types';
import {
  calcPct,
  formatDuration,
  formatNum,
  formatPctDelta,
  getLocale,
  getReasonLabel,
  tr,
} from '../data/i18n';
import { calculateTotals } from '../utils/storage';
import { TwentyFourHourChart } from './TwentyFourHourChart';

interface CalendarViewProps {
  state: AppState;
  todayKey: string;
  hasWallpaper: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  state,
  todayKey,
  hasWallpaper,
}) => {
  const [month, setMonth] = useState(() => parseInt(todayKey.slice(5, 7), 10) - 1);
  const [year, setYear] = useState(() => parseInt(todayKey.slice(0, 4), 10));
  const [selectedDay, setSelectedDay] = useState<string | null>(todayKey);

  const lang = state.lang;
  const locale = getLocale(lang);
  const headingClass = hasWallpaper
    ? 'font-display text-base sm:text-lg font-bold text-white drop-shadow-sm'
    : 'font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100';

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();
  const monthTitle = firstOfMonth.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const weekdays = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    new Date(2024, 0, 7 + i).toLocaleDateString(locale, { weekday: 'short' }),
  );

  const shiftMonth = (delta: number) => {
    let nextM = month + delta;
    let nextY = year;
    if (nextM < 0) {
      nextM = 11;
      nextY -= 1;
    } else if (nextM > 11) {
      nextM = 0;
      nextY += 1;
    }
    setMonth(nextM);
    setYear(nextY);
    setSelectedDay(null);
  };

  const renderDayDetail = (key: string) => {
    const log = state.logs[key];
    const formattedDate = new Date(`${key}T12:00:00Z`).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

    if (!log || !log.tasks.length) {
      return (
        <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
            {formattedDate}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {tr('noLogDay', lang)}
          </p>
        </div>
      );
    }

    const totals = calculateTotals(log);
    const overallPct = calcPct(totals.a, totals.all);
    const metAll = overallPct >= 0;

    return (
      <div className="space-y-4">
        <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                {formattedDate}
              </h3>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {tr('done', lang)} {formatDuration(totals.a, lang)} / {tr('planned', lang)}{' '}
                {formatDuration(totals.all, lang)}
              </div>
            </div>
            {totals.all > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums whitespace-nowrap ${
                  metAll
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-700 dark:text-red-400'
                }`}
              >
                {metAll ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>{formatPctDelta(overallPct, lang)}</span>
              </span>
            )}
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {log.tasks.map((task) => {
              const actual = task.actual || 0;
              const delta = calcPct(actual, task.planned);
              const met = actual >= task.planned;
              return (
                <div key={task.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {task.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                        {tr('planned', lang)} {formatDuration(task.planned, lang)} ·{' '}
                        {tr('done', lang)}{' '}
                        {task.actual == null ? tr('notDone', lang) : formatDuration(actual, lang)}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold tabular-nums whitespace-nowrap ${
                        met
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {formatPctDelta(delta, lang)}
                    </span>
                  </div>

                  {task.note && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 whitespace-pre-wrap">
                      <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                      <span>{task.note}</span>
                    </div>
                  )}

                  {task.rs && task.rs.length > 0 && (
                    <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      {task.rs.map((rk) => getReasonLabel(rk, lang)).join(' · ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              {tr('chart24h', lang)}
            </div>
            <TwentyFourHourChart log={log} chartStyle={state.cst || 'bar'} lang={lang} />
          </div>
        </div>

        {log.note && (
          <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
              <BookOpen className="w-4 h-4 text-[var(--pri)]" />
              <span>{tr('diaryOfDay', lang)}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {log.note}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-6 space-y-4">
        <h2 className={headingClass}>{tr('calendar', lang)}</h2>
        <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              {monthTitle}
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mt-4">
            {weekdays.map((wd) => (
              <div
                key={wd}
                className="text-center text-[11px] font-medium text-slate-500 dark:text-slate-400 pb-1"
              >
                {wd}
              </div>
            ))}
            {Array.from({ length: startWeekday }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const log = state.logs[dateKey];
              let status: 'none' | 'ok' | 'bad' = 'none';
              if (log && log.tasks.some((t) => t.actual != null)) {
                const totals = calculateTotals(log);
                status = totals.a >= totals.all ? 'ok' : 'bad';
              }
              const isSelected = selectedDay === dateKey;
              const isToday = todayKey === dateKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDay(dateKey)}
                  className={`h-11 rounded-xl text-sm font-medium tabular-nums transition-all cursor-pointer ${
                    status === 'ok'
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                      : status === 'bad'
                        ? 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  } ${isToday ? 'ring-2 ring-[var(--pri)]' : ''} ${
                    isSelected ? 'outline-2 outline-offset-1 outline-slate-900 dark:outline-white' : ''
                  }`}
                >
                  {formatNum(day, lang)}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {tr('calendarHint', lang)}
          </p>
        </div>
      </div>

      <div className="lg:col-span-6 space-y-4">
        <h2 className={headingClass}>{tr('todaysDiary', lang).split(' ')[0]} · {tr('report', lang)}</h2>
        {selectedDay ? (
          renderDayDetail(selectedDay)
        ) : (
          <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-sm text-slate-500 dark:text-slate-400">
            {tr('tapDateHint', lang)}
          </div>
        )}
      </div>
    </div>
  );
};
