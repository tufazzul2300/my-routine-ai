import React from 'react';
import { Check, Pause, Play, TrendingDown, TrendingUp } from 'lucide-react';
import type { ActiveTimer, DayTaskLog, LanguageCode, LessReasonKey, TaskCardStyle } from '../types';
import {
  calcPct,
  formatDuration,
  formatPctDelta,
  getReasonLabel,
  tr,
} from '../data/i18n';
import { formatTimerHMS, getTaskColor, getTaskProgressPct } from '../utils/storage';

const LESS_REASONS: LessReasonKey[] = ['phone', 'tired', 'away', 'sick', 'distracted'];

interface TaskCardProps {
  task: DayTaskLog;
  cardStyle?: TaskCardStyle;
  lang?: LanguageCode;
  timer?: ActiveTimer | null;
  nowMs?: number;
  onUpdateActual: (minutes: number | null) => void;
  onMarkFull: () => void;
  onToggleTimer: () => void;
  onUpdateNote: (note: string) => void;
  onToggleReason: (reason: LessReasonKey) => void;
  previewMode?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  cardStyle = 'classic',
  lang,
  timer,
  nowMs = Date.now(),
  onUpdateActual,
  onMarkFull,
  onToggleTimer,
  onUpdateNote,
  onToggleReason,
  previewMode = false,
}) => {
  const color = getTaskColor(task.id);
  const progress = getTaskProgressPct(task);
  const isTimerActive = timer?.id === task.id;
  const showReasons = task.actual != null && task.actual < task.planned;

  const hoursVal = task.actual == null ? '' : String(Math.floor(task.actual / 60));
  const minsVal = task.actual == null ? '' : String(task.actual % 60);

  const handleTimeChange = (nextH: string, nextM: string) => {
    if (nextH === '' && nextM === '') {
      onUpdateActual(null);
      return;
    }
    const h = Math.max(0, parseInt(nextH || '0', 10) || 0);
    const m = Math.max(0, parseInt(nextM || '0', 10) || 0);
    onUpdateActual(h * 60 + m);
  };

  const renderDeltaIndicator = () => {
    if (task.actual == null) {
      return <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums">—</span>;
    }
    const delta = calcPct(task.actual, task.planned);
    const met = task.actual >= task.planned;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums whitespace-nowrap shrink-0 ${
          met ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
        }`}
      >
        {met ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span>{formatPctDelta(delta, lang)}</span>
      </span>
    );
  };

  const renderTimeInputs = (compact = false) => (
    <div className="flex items-center gap-1.5 shrink-0">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="0"
        aria-label={`${task.name} hours`}
        value={hoursVal}
        onChange={(e) => handleTimeChange(e.target.value, minsVal)}
        className={`${
          compact ? 'w-11 py-1.5' : 'w-12 py-2'
        } text-center font-mono-num text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]`}
      />
      <span className="text-xs text-slate-500 dark:text-slate-400">{tr('hShort', lang)}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="0"
        aria-label={`${task.name} minutes`}
        value={minsVal}
        onChange={(e) => handleTimeChange(hoursVal, e.target.value)}
        className={`${
          compact ? 'w-11 py-1.5' : 'w-12 py-2'
        } text-center font-mono-num text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]`}
      />
      <span className="text-xs text-slate-500 dark:text-slate-400">{tr('mShort', lang)}</span>
    </div>
  );

  const renderTimerButton = () => (
    <button
      type="button"
      onClick={onToggleTimer}
      className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
        isTimerActive
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
      }`}
    >
      {isTimerActive ? (
        <>
          <Pause className="w-3.5 h-3.5" />
          <span className="font-mono-num">{formatTimerHMS(nowMs - (timer?.start || nowMs))}</span>
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5" />
          <span>{tr('start', lang)}</span>
        </>
      )}
    </button>
  );

  const renderReasons = () => {
    if (!showReasons) return null;
    return (
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          {tr('whyLess', lang)}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LESS_REASONS.map((rk) => {
            const active = (task.rs || []).includes(rk);
            return (
              <button
                key={rk}
                type="button"
                onClick={() => onToggleReason(rk)}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--pri)] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {getReasonLabel(rk, lang)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (cardStyle === 'compact') {
    return (
      <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
              {task.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {renderTimerButton()}
            {renderDeltaIndicator()}
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {tr('plannedTime', lang)}: {formatDuration(task.planned, lang)}
          </span>
          <div className="flex items-center gap-1.5">
            {renderTimeInputs(true)}
            <button
              type="button"
              onClick={onMarkFull}
              aria-label={tr('didItAll', lang)}
              className="min-h-[36px] min-w-[36px] px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>

        {!previewMode && (
          <textarea
            rows={1}
            value={task.note || ''}
            onChange={(e) => onUpdateNote(e.target.value)}
            placeholder={tr('taskNotePlaceholder', lang)}
            className="mt-2.5 w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--pri)] resize-y"
          />
        )}

        {renderReasons()}
      </div>
    );
  }

  if (cardStyle === 'tiles') {
    return (
      <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col items-center text-center gap-2.5">
        <div
          className="w-14 h-14 rounded-full grid place-items-center"
          style={{
            background: `conic-gradient(${color} ${progress}%, rgba(148,163,184,0.22) 0)`,
          }}
        >
          <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[11px] font-mono-num font-semibold text-slate-700 dark:text-slate-300">
            {progress}%
          </div>
        </div>

        <div className="w-full min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
            {task.name}
          </h3>
          <div className="mt-0.5 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="tabular-nums">{formatDuration(task.planned, lang)}</span>
            <span aria-hidden="true">·</span>
            {renderDeltaIndicator()}
          </div>
        </div>

        {renderTimeInputs(true)}

        <div className="flex flex-wrap items-center justify-center gap-2 w-full">
          <button
            type="button"
            onClick={onMarkFull}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{tr('didItAll', lang)}</span>
          </button>
          {renderTimerButton()}
        </div>

        {!previewMode && (
          <textarea
            rows={2}
            value={task.note || ''}
            onChange={(e) => onUpdateNote(e.target.value)}
            placeholder={tr('taskNotePlaceholder', lang)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--pri)] resize-y text-start"
          />
        )}

        <div className="w-full text-start">{renderReasons()}</div>
      </div>
    );
  }

  // Classic layout
  return (
    <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 truncate">
            {task.name}
          </h3>
        </div>
        {renderDeltaIndicator()}
      </div>

      <div className="mt-3 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">{tr('plannedTime', lang)}</div>
          <div className="mt-1 font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 tabular-nums">
            {formatDuration(task.planned, lang)}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">{tr('timeDone', lang)}</div>
          <div className="mt-1">{renderTimeInputs(false)}</div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onMarkFull}
          className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>{tr('didItAll', lang)}</span>
        </button>
        {renderTimerButton()}
      </div>

      {!previewMode && (
        <textarea
          rows={2}
          value={task.note || ''}
          onChange={(e) => onUpdateNote(e.target.value)}
          placeholder={tr('taskNotePlaceholder', lang)}
          className="mt-3 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--pri)] resize-y"
        />
      )}

      {renderReasons()}
    </div>
  );
};
