import React, { useState } from 'react';
import { Award, CalendarCheck, Flame, Sprout, Star, Target, Trophy } from 'lucide-react';
import type { AppState, LessReasonKey } from '../types';
import { formatDuration, formatNum, getLocale, getReasonLabel, tr } from '../data/i18n';
import {
  calculateStreaks,
  calculateTotals,
  getRecentDayKeys,
  getTaskColor,
  normalizeActivityKey,
} from '../utils/storage';

interface ReportViewProps {
  state: AppState;
  todayKey: string;
  hasWallpaper: boolean;
  onChangePeriod: (rp: '7' | '30') => void;
  onSetWeeklyGoal: (goalHours: number) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  state,
  todayKey,
  hasWallpaper,
  onChangePeriod,
  onSetWeeklyGoal,
}) => {
  const [goalInput, setGoalInput] = useState(state.goalH ? String(state.goalH) : '');
  const lang = state.lang;
  const locale = getLocale(lang);
  const period = state.rp === '30' ? 30 : 7;
  const keys = getRecentDayKeys(period, todayKey);
  const logs = keys.map((k) => state.logs[k]).filter(Boolean);

  const dayStats = keys
    .map((k) => ({ key: k, log: state.logs[k] }))
    .filter((d) => Boolean(d.log))
    .map((d) => ({ key: d.key, log: d.log, totals: calculateTotals(d.log) }))
    .filter((d) => d.totals.all > 0 && d.log.tasks.some((t) => t.actual != null));

  const totalActual = dayStats.reduce((sum, d) => sum + d.totals.a, 0);
  const totalPlanned = dayStats.reduce((sum, d) => sum + d.totals.all, 0);
  const avgPct = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
  const ratio = (d: (typeof dayStats)[number]) => d.totals.a / d.totals.all;
  const streaks = calculateStreaks(state.logs, todayKey);

  const dayLabel = (dateKey: string) =>
    new Date(`${dateKey}T12:00:00Z`).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });

  const formatDaysCount = (n: number) =>
    `${formatNum(n, lang)} ${n === 1 ? tr('dayUnit', lang) : tr('daysUnit', lang)}`;

  const headingClass = hasWallpaper
    ? 'font-display text-base sm:text-lg font-bold text-white drop-shadow-sm'
    : 'font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100';

  // Weekly Goal & Badges
  const last7Minutes = getRecentDayKeys(7, todayKey).reduce(
    (sum, k) => (state.logs[k] ? sum + calculateTotals(state.logs[k]).a : sum),
    0,
  );
  const goalMinutes = (state.goalH || 0) * 60;
  const loggedDaysCount = Object.values(state.logs).filter((l) =>
    l.tasks.some((t) => t.actual != null),
  ).length;

  const badgeItems = [
    {
      key: 'first',
      label: tr('badgeFirst', lang),
      earned: loggedDaysCount >= 1,
      Icon: Sprout,
    },
    {
      key: 's3',
      label: tr('badgeS3', lang),
      earned: streaks.best >= 3,
      Icon: Flame,
    },
    {
      key: 's7',
      label: tr('badgeS7', lang),
      earned: streaks.best >= 7,
      Icon: Trophy,
    },
    {
      key: 'perfect',
      label: tr('badgePerfect', lang),
      earned: streaks.best >= 1,
      Icon: Star,
    },
    {
      key: 'd10',
      label: tr('badgeD10', lang),
      earned: loggedDaysCount >= 10,
      Icon: CalendarCheck,
    },
    {
      key: 'goal',
      label: tr('badgeGoal', lang),
      earned: goalMinutes > 0 && last7Minutes >= goalMinutes,
      Icon: Target,
    },
  ];

  // Aggregate time by activity
  const activityAgg: Record<string, { name: string; minutes: number; color: string }> = {};
  logs.forEach((l) => {
    l.tasks.forEach((t) => {
      if (t.actual && t.actual > 0) {
        const k = normalizeActivityKey(t.name);
        if (!activityAgg[k]) {
          activityAgg[k] = { name: t.name, minutes: 0, color: getTaskColor(t.id) };
        }
        activityAgg[k].minutes += t.actual;
      }
    });
    (l.extras || []).forEach((x) => {
      const k = normalizeActivityKey(x.name);
      if (!activityAgg[k]) {
        activityAgg[k] = { name: x.name, minutes: 0, color: '#94a3b8' };
      }
      activityAgg[k].minutes += x.m;
    });
  });

  const topActivities = Object.values(activityAgg)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 6);
  const maxActivityMinutes = topActivities.length ? topActivities[0].minutes : 1;

  // Aggregate reasons
  const reasonCounts: Record<string, number> = {};
  logs.forEach((l) =>
    l.tasks.forEach((t) =>
      (t.rs || []).forEach((rk) => {
        reasonCounts[rk] = (reasonCounts[rk] || 0) + 1;
      }),
    ),
  );
  const rankedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);

  const best = dayStats.length
    ? dayStats.reduce((x, y) => (ratio(y) > ratio(x) ? y : x))
    : null;
  const worst = dayStats.length
    ? dayStats.reduce((x, y) => (ratio(y) < ratio(x) ? y : x))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={headingClass}>{tr('report', lang)}</h2>
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {(['7', '30'] as const).map((val) => {
            const active = (state.rp || '7') === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onChangePeriod(val)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {val === '7' ? tr('last7Days', lang) : tr('last30Days', lang)}
              </button>
            );
          })}
        </div>
      </div>

      {!dayStats.length ? (
        <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-sm text-slate-500 dark:text-slate-400">
          {tr('noDataYet', lang)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KPIs + Bar Chart */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: tr('average', lang), value: `${formatNum(avgPct, lang)}%` },
                { label: tr('totalDone', lang), value: formatDuration(totalActual, lang) },
                {
                  label: tr('bestDay', lang),
                  value: best
                    ? `${dayLabel(best.key)} · ${formatNum(Math.round(ratio(best) * 100), lang)}%`
                    : '—',
                },
                {
                  label: tr('weakestDay', lang),
                  value: worst
                    ? `${dayLabel(worst.key)} · ${formatNum(Math.round(ratio(worst) * 100), lang)}%`
                    : '—',
                },
                { label: tr('streak', lang), value: formatDaysCount(streaks.cur) },
                { label: tr('bestStreak', lang), value: formatDaysCount(streaks.best) },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400">{tile.label}</div>
                  <div className="mt-1 font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 tabular-nums">
                    {tile.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div
                className="flex items-end h-32"
                style={{ gap: period > 7 ? '3px' : '8px' }}
              >
                {keys.map((k) => {
                  const found = dayStats.find((d) => d.key === k);
                  const val = found ? Math.min(1.2, ratio(found)) : 0;
                  const barHeight = Math.max(4, Math.round((val / 1.2) * 120));
                  const barColor = found
                    ? ratio(found) >= 1
                      ? '#10b981'
                      : 'var(--pri)'
                    : undefined;
                  return (
                    <div
                      key={k}
                      title={`${dayLabel(k)}${found ? `: ${Math.round(ratio(found) * 100)}%` : ''}`}
                      className={`flex-1 rounded-t-sm transition-all duration-200 ${
                        !found ? 'bg-slate-100 dark:bg-slate-800' : ''
                      }`}
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: barColor,
                      }}
                    />
                  );
                })}
              </div>
              <div
                className="flex mt-2"
                style={{ gap: period > 7 ? '3px' : '8px' }}
              >
                {keys.map((k, idx) => (
                  <div
                    key={k}
                    className={`flex-1 text-center tabular-nums text-slate-500 dark:text-slate-400 ${
                      period > 7 ? 'text-[10px]' : 'text-xs'
                    }`}
                  >
                    {period > 7 && idx % 5 !== 0 ? '' : formatNum(+k.slice(8), lang)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Activity breakdown & Top reasons */}
          <div className="lg:col-span-5 space-y-6">
            <section>
              <h3 className={`${headingClass} mb-3`}>{tr('timeByActivity', lang)}</h3>
              <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                {topActivities.length ? (
                  topActivities.map((row) => (
                    <div key={row.name}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: row.color }}
                          />
                          <span className="truncate text-slate-800 dark:text-slate-200">
                            {row.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                          {formatDuration(row.minutes, lang)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round((row.minutes / maxActivityMinutes) * 100)}%`,
                            backgroundColor: row.color,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {tr('noDataYet', lang)}
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className={`${headingClass} mb-3`}>{tr('topReasons', lang)}</h3>
              <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2.5">
                {rankedReasons.length ? (
                  rankedReasons.map(([rk, count]) => (
                    <div key={rk} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        {getReasonLabel(rk as LessReasonKey, lang)}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatNum(count, lang)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {tr('noDataYet', lang)}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Weekly Goal & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-5">
          <h3 className={`${headingClass} mb-3`}>{tr('weeklyGoal', lang)}</h3>
          <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSetWeeklyGoal(Math.max(0, parseInt(goalInput || '0', 10) || 0));
              }}
              className="flex items-center justify-between gap-3"
            >
              <label
                htmlFor="weekly-goal-input"
                className="text-xs sm:text-sm text-slate-600 dark:text-slate-400"
              >
                {tr('weeklyGoalHours', lang)}
              </label>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  id="weekly-goal-input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-16 py-2 text-center font-mono-num text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
                />
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[var(--pri)] text-white text-xs sm:text-sm font-medium hover:opacity-90 cursor-pointer"
                >
                  {tr('set', lang)}
                </button>
              </div>
            </form>

            {goalMinutes > 0 && (
              <div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--pri)] transition-all duration-200"
                    style={{ width: `${Math.min(100, Math.round((last7Minutes / goalMinutes) * 100))}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {formatDuration(last7Minutes, lang)} / {formatDuration(goalMinutes, lang)}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-7">
          <h3 className={`${headingClass} mb-3 flex items-center gap-2`}>
            <Award className="w-4 h-4 text-[var(--pri)]" />
            <span>{tr('badges', lang)}</span>
          </h3>
          <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
              {badgeItems.map(({ key, label, earned, Icon }) => (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-2 transition-opacity ${
                    earned ? 'opacity-100' : 'opacity-35 grayscale'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      earned
                        ? 'bg-[var(--pri)]/12 text-[var(--pri)]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
