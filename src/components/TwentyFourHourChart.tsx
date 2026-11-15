import React, { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import type { ChartStyle, DayLog, LanguageCode } from '../types';
import { formatDuration, formatNum, tr } from '../data/i18n';
import {
  EXTRA_COLORS,
  getTaskColor,
  groupExtras,
  normalizeActivityKey,
} from '../utils/storage';

interface TwentyFourHourChartProps {
  log: DayLog;
  chartStyle?: ChartStyle;
  lang?: LanguageCode;
}

interface Segment {
  name: string;
  minutes: number;
  color: string;
}

export const TwentyFourHourChart: React.FC<TwentyFourHourChartProps> = ({
  log,
  chartStyle = 'bar',
  lang,
}) => {
  const segments: Segment[] = [];
  const indexMap: Record<string, number> = {};

  const addSegment = (name: string, minutes: number, color: string) => {
    const key = normalizeActivityKey(name);
    if (indexMap[key] == null) {
      indexMap[key] = segments.length;
      segments.push({ name, minutes: 0, color });
    }
    segments[indexMap[key]].minutes += minutes;
  };

  log.tasks.forEach((task) => {
    if (task.actual && task.actual > 0) {
      addSegment(task.name, task.actual, getTaskColor(task.id));
    }
  });

  groupExtras(log).forEach((g, idx) => {
    if (g.totalMinutes > 0) {
      addSegment(g.name, g.totalMinutes, EXTRA_COLORS[idx % EXTRA_COLORS.length]);
    }
  });

  if (!segments.length) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {tr('noTimeAdded', lang)}
      </div>
    );
  }

  const total = segments.reduce((s, seg) => s + seg.minutes, 0);
  const scale = Math.max(1440, total);
  const left = 1440 - total;
  const circumference = 2 * Math.PI * 54;
  let offset = 0;

  return (
    <div>
      {chartStyle === 'donut' ? (
        <div className="flex justify-center py-2">
          <svg viewBox="0 0 140 140" className="w-40 h-40">
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke="rgba(148,163,184,0.2)"
              strokeWidth="18"
            />
            {segments.map((seg) => {
              const len = (seg.minutes / scale) * circumference;
              const dashOffset = -offset;
              offset += len;
              return (
                <circle
                  key={seg.name}
                  cx="70"
                  cy="70"
                  r="54"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="18"
                  strokeDasharray={`${len} ${Math.max(0, circumference - len)}`}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 70 70)"
                />
              );
            })}
            <text
              x="70"
              y="70"
              textAnchor="middle"
              fontSize="21"
              fontWeight="700"
              fill="currentColor"
              className="font-mono-num text-slate-900 dark:text-slate-100"
            >
              {formatNum(Math.round(total / 6) / 10, lang)} {tr('hShort', lang)}
            </text>
            <text
              x="70"
              y="90"
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              className="text-slate-500 dark:text-slate-400"
            >
              / {formatNum(24, lang)} {tr('hShort', lang)}
            </text>
          </svg>
        </div>
      ) : (
        <div className="h-6 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          {segments.map((seg) => (
            <div
              key={seg.name}
              style={{
                width: `${(seg.minutes / scale) * 100}%`,
                backgroundColor: seg.color,
              }}
              title={`${seg.name}: ${formatDuration(seg.minutes, lang)}`}
              className="h-full transition-all duration-200"
            />
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {segments
          .slice()
          .sort((a, b) => b.minutes - a.minutes)
          .map((seg) => (
            <div key={seg.name} className="flex items-center gap-2.5 text-sm">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 min-w-0 truncate text-slate-800 dark:text-slate-200">
                {seg.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                {formatDuration(seg.minutes, lang)}
              </span>
              <span className="w-12 text-end font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatNum(Math.round((seg.minutes / 1440) * 100), lang)}%
              </span>
            </div>
          ))}

        {left >= 0 ? (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
            <span className="flex-1">{tr('unaccounted', lang)}</span>
            <span className="tabular-nums">{formatDuration(left, lang)}</span>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-red-600 dark:text-red-400">
            {tr('over24h', lang)}
          </div>
        )}
      </div>
    </div>
  );
};

interface TwentyFourHourModalProps {
  log: DayLog;
  chartStyle?: ChartStyle;
  lang?: LanguageCode;
  onAddExtra: (name: string, minutes: number) => void;
  onRemoveExtra: (index: number) => void;
  onClose: () => void;
}

export const TwentyFourHourModal: React.FC<TwentyFourHourModalProps> = ({
  log,
  chartStyle,
  lang,
  onAddExtra,
  onRemoveExtra,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [hours, setHours] = useState('');
  const [mins, setMins] = useState('');
  const [error, setError] = useState('');

  const quickChips = [
    tr('sleep', lang),
    tr('meals', lang),
    tr('phone', lang),
    tr('hangout', lang),
    tr('travel', lang),
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const totalMins = (parseInt(hours || '0', 10) || 0) * 60 + (parseInt(mins || '0', 10) || 0);
    if (!trimmed) {
      setError(tr('enterWhatFor', lang));
      return;
    }
    if (totalMins <= 0) {
      setError(tr('enterHowMuchTime', lang));
      return;
    }
    setError('');
    onAddExtra(trimmed, totalMins);
    setName('');
    setHours('');
    setMins('');
  };

  const groups = groupExtras(log);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 pb-safe shadow-2xl">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            {tr('chart24h', lang)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4">
          <TwentyFourHourChart log={log} chartStyle={chartStyle} lang={lang} />
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            {tr('otherTimeTitle', lang)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {tr('otherTimeHint', lang)}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setName(chip)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  name === chip
                    ? 'bg-[var(--pri)] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd} className="mt-3 space-y-2.5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tr('whatForPlaceholder', lang)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder={tr('hr', lang)}
                className="w-16 py-2 text-center font-mono-num text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">{tr('hShort', lang)}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={mins}
                onChange={(e) => setMins(e.target.value)}
                placeholder={tr('min', lang)}
                className="w-16 py-2 text-center font-mono-num text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">{tr('mShort', lang)}</span>
              <div className="flex-1" />
              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[var(--pri)] text-white text-sm font-medium inline-flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{tr('add', lang)}</span>
              </button>
            </div>
            {error && <div className="text-xs text-red-600 dark:text-red-400">{error}</div>}
          </form>

          {groups.length > 0 && (
            <div className="mt-4 space-y-2.5">
              {groups.map((g, gi) => (
                <div
                  key={g.key}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/70 dark:border-slate-700/70"
                >
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: EXTRA_COLORS[gi % EXTRA_COLORS.length] }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {g.name}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatDuration(g.totalMinutes, lang)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 ps-4">
                    {g.parts.map((part) => (
                      <button
                        key={part.index}
                        type="button"
                        onClick={() => onRemoveExtra(part.index)}
                        className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-700 dark:hover:text-red-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span className="tabular-nums">{formatDuration(part.m, lang)}</span>
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full min-h-[44px] py-2.5 rounded-xl bg-[var(--pri)] text-white font-medium text-sm inline-flex items-center justify-center gap-1.5 hover:opacity-90 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>{tr('save', lang)}</span>
        </button>
      </div>
    </div>
  );
};
