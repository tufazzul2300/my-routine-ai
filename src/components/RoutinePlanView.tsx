import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { AppState } from '../types';
import { formatDuration, tr } from '../data/i18n';
import { getTaskColor } from '../utils/storage';

interface RoutinePlanViewProps {
  state: AppState;
  hasWallpaper: boolean;
  onAddRoutineTask: (name: string, plannedMinutes: number) => void;
  onUpdateRoutineTask: (index: number, patch: { name?: string; planned?: number }) => void;
  onDeleteRoutineTask: (index: number) => void;
  onAddDailyFixed: (name: string, minutes: number) => void;
  onDeleteDailyFixed: (index: number) => void;
}

export const RoutinePlanView: React.FC<RoutinePlanViewProps> = ({
  state,
  hasWallpaper,
  onAddRoutineTask,
  onUpdateRoutineTask,
  onDeleteRoutineTask,
  onAddDailyFixed,
  onDeleteDailyFixed,
}) => {
  const [newName, setNewName] = useState('');
  const [newH, setNewH] = useState('');
  const [newM, setNewM] = useState('');
  const [taskError, setTaskError] = useState('');

  const [dailyName, setDailyName] = useState('');
  const [dailyH, setDailyH] = useState('');
  const [dailyM, setDailyM] = useState('');
  const [dailyError, setDailyError] = useState('');

  const [armedDeleteIdx, setArmedDeleteIdx] = useState<number | null>(null);

  const lang = state.lang;
  const headingClass = hasWallpaper
    ? 'font-display text-base sm:text-lg font-bold text-white drop-shadow-sm'
    : 'font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100';

  const totalPlanned = state.routine.reduce((sum, t) => sum + t.planned, 0);
  const leftMinutes = 1440 - totalPlanned;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    const minutes = (parseInt(newH || '0', 10) || 0) * 60 + (parseInt(newM || '0', 10) || 0);
    if (!trimmed) {
      setTaskError(tr('enterTaskName', lang));
      return;
    }
    if (minutes <= 0) {
      setTaskError(tr('enterHowMuchTime', lang));
      return;
    }
    setTaskError('');
    onAddRoutineTask(trimmed, minutes);
    setNewName('');
    setNewH('');
    setNewM('');
    setArmedDeleteIdx(null);
  };

  const handleAddDaily = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = dailyName.trim();
    const minutes = (parseInt(dailyH || '0', 10) || 0) * 60 + (parseInt(dailyM || '0', 10) || 0);
    if (!trimmed) {
      setDailyError(tr('enterWhatFor', lang));
      return;
    }
    if (minutes <= 0) {
      setDailyError(tr('enterHowMuchTime', lang));
      return;
    }
    setDailyError('');
    onAddDailyFixed(trimmed, minutes);
    setDailyName('');
    setDailyH('');
    setDailyM('');
  };

  const handleDeleteClick = (idx: number) => {
    if (armedDeleteIdx !== idx) {
      setArmedDeleteIdx(idx);
      return;
    }
    onDeleteRoutineTask(idx);
    setArmedDeleteIdx(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left column: Add new task + 24-hour budget + Daily fixed time */}
      <div className="lg:col-span-5 space-y-6">
        <section>
          <h2 className={`${headingClass} mb-3`}>{tr('addNewTask', lang)}</h2>
          <form
            onSubmit={handleAddTask}
            className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={tr('taskNamePlaceholder', lang)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {tr('timeLabel', lang)}
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={newH}
                onChange={(e) => setNewH(e.target.value)}
                placeholder={tr('hr', lang)}
                className="w-16 py-2 text-center font-mono-num text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">{tr('hShort', lang)}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={newM}
                onChange={(e) => setNewM(e.target.value)}
                placeholder={tr('min', lang)}
                className="w-16 py-2 text-center font-mono-num text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">{tr('mShort', lang)}</span>
              <div className="flex-1" />
              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[var(--pri)] text-white text-sm font-medium inline-flex items-center gap-1.5 hover:opacity-90 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{tr('add', lang)}</span>
              </button>
            </div>
            {taskError && <div className="text-xs text-red-600 dark:text-red-400">{taskError}</div>}
          </form>
        </section>

        <section>
          <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                {tr('budget24h', lang)}
              </h3>
              <span
                className={`text-xs sm:text-sm font-medium tabular-nums ${
                  leftMinutes < 0
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {leftMinutes < 0
                  ? `${formatDuration(-leftMinutes, lang)} ${tr('over', lang)}`
                  : `${tr('left', lang)}: ${formatDuration(leftMinutes, lang)}`}
              </span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${Math.min(100, totalPlanned / 14.4)}%`,
                  backgroundColor: leftMinutes < 0 ? '#ef4444' : 'var(--pri)',
                }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {tr('totalPlanned', lang)}: {formatDuration(totalPlanned, lang)}
            </div>
          </div>
        </section>

        <section>
          <h2 className={`${headingClass} mb-3`}>{tr('dailyFixedTime', lang)}</h2>
          <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tr('dailyFixedHint', lang)}
            </p>
            <form onSubmit={handleAddDaily} className="space-y-2.5">
              <input
                type="text"
                value={dailyName}
                onChange={(e) => setDailyName(e.target.value)}
                placeholder={tr('whatForPlaceholder', lang)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={dailyH}
                  onChange={(e) => setDailyH(e.target.value)}
                  placeholder={tr('hr', lang)}
                  className="w-16 py-2 text-center font-mono-num text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">{tr('hShort', lang)}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={dailyM}
                  onChange={(e) => setDailyM(e.target.value)}
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
              {dailyError && <div className="text-xs text-red-600 dark:text-red-400">{dailyError}</div>}
            </form>

            {(state.daily || []).length > 0 && (
              <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                {(state.daily || []).map((item, idx) => (
                  <div key={`${item.name}-${idx}`} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatDuration(item.m, lang)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteDailyFixed(idx)}
                        aria-label={tr('delete', lang)}
                        className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Right column: All my tasks */}
      <div className="lg:col-span-7 space-y-4">
        <h2 className={headingClass}>{tr('allMyTasks', lang)}</h2>

        {!state.routine.length ? (
          <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-sm text-slate-500 dark:text-slate-400">
            {tr('noTasksYet', lang)}
          </div>
        ) : (
          <div className="space-y-3">
            {state.routine.map((task, idx) => {
              const h = Math.floor(task.planned / 60);
              const m = task.planned % 60;
              const isArmed = armedDeleteIdx === idx;
              return (
                <div
                  key={task.id}
                  className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: getTaskColor(task.id) }}
                    />
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) => onUpdateRoutineTask(idx, { name: e.target.value })}
                      placeholder={tr('taskName', lang)}
                      className="flex-1 min-w-0 px-3 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(idx)}
                      className={`min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        isArmed
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isArmed ? tr('sure', lang) : tr('delete', lang)}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 ps-5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {tr('timeLabel', lang)}
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={h}
                      onChange={(e) => {
                        const nextH = Math.max(0, parseInt(e.target.value || '0', 10) || 0);
                        onUpdateRoutineTask(idx, { planned: nextH * 60 + m });
                      }}
                      className="w-14 py-1.5 text-center font-mono-num text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {tr('hShort', lang)}
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={m}
                      onChange={(e) => {
                        const nextM = Math.max(0, parseInt(e.target.value || '0', 10) || 0);
                        onUpdateRoutineTask(idx, { planned: h * 60 + nextM });
                      }}
                      className="w-14 py-1.5 text-center font-mono-num text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {tr('mShort', lang)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p
          className={`text-xs ${
            hasWallpaper ? 'text-white/90 drop-shadow-sm' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {tr('routineHint', lang)}
        </p>
      </div>
    </div>
  );
};
